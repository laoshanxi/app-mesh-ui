import { getClient } from '@/utils/appmeshClient'

function runFinished(vueComp) {
  vueComp.index = -1;
  if (vueComp.timer) {
    clearInterval(vueComp.timer);
    vueComp.timer = null;
  }
  vueComp.input = '';
  vueComp.inputDisabled = false;
  vueComp.$nextTick(() => {
    let shell = vueComp.$refs['shell_div'];
    if (shell) shell.scrollTop = shell.scrollHeight;
    if (vueComp.$refs["input"]) vueComp.$refs["input"].focus();
  });
}
function refreshShellContents(vueComp, content) {
  const command = vueComp.input.replace(/^ +/g, "");
  if (command.startsWith("cd ")) {
    vueComp.shellApp.working_dir = content;
  }
  if (typeof content === 'object') {
    vueComp.shellContents.push({ type: "json", content });
    return;
  }
  content = String(content);
  const isLs = command.startsWith("ls ") || command === "ls";
  if (!content.startsWith("ls:") && isLs) {
    let dir = vueComp.shellApp.working_dir || ".";
    if (command !== "ls") {
      const parsed = command.replace(/ -[a-z]/g, ' ').replace(/ls /g, '').replace(' ', '');
      dir = parsed.startsWith("/") ? parsed : dir + "/" + parsed;
    }
    const hasLongFormat = command.includes(" -l");
    const lines = content.split(/[\n\r]/g);
    if (lines[lines.length - 1].length === 0) lines.pop();
    lines.forEach((item, index) => {
      const fileName = hasLongFormat ? item.substring(item.lastIndexOf(" ") + 1) : item;
      if (hasLongFormat && index === 0) {
        vueComp.shellContents.push({ content: item });
      } else {
        vueComp.shellContents.push({ content: item, dir, fileName, type: "file" });
      }
    });
  } else {
    vueComp.shellContents.push({ content });
  }

  vueComp.$nextTick(() => {
    const shell = vueComp.$refs['shell_div'];
    if (shell) shell.scrollTop = shell.scrollHeight;
  });
}

export default {
  connectHost: function (vueComp) {
    vueComp.connected = 1;
    vueComp.shellApp.command = 'who';
    getClient().run_app_sync(vueComp.shellApp, null, vueComp.timeout).then(() => {
      vueComp.connected = 2;
      runFinished(vueComp);
    })
      .catch(() => {
        vueComp.connected = 0;
        vueComp.shellContents.push(
          {
            content: "# Connected remote host failed."
          }
        );
      });
  },
  run: function (vueComp) {
    let command = vueComp.input.replace(/^ +/g, "");
    if (command.startsWith("cd ")) {
      command = command + ";pwd";
    }
    vueComp.shellApp.command = command;
    vueComp.$nextTick(() => {
      const shell = vueComp.$refs['shell_div'];
      if (shell) shell.scrollTop = shell.scrollHeight;
    });

    const outputHandler = output => refreshShellContents(vueComp, output);

    if (vueComp.isSync) {
      getClient().run_app_sync(vueComp.shellApp, outputHandler, vueComp.timeout)
        .catch((error) => {
          outputHandler("# Failed: " + error.message);
        })
        .finally(() => {
          runFinished(vueComp);
        });
    } else {
      getClient().run_app_async(vueComp.shellApp, vueComp.timeout)
        .then((run) => run.wait(outputHandler))
        .catch((error) => {
          outputHandler("# Failed: " + error.message);
        })
        .finally(() => {
          runFinished(vueComp);
        });
    }
  },
}
