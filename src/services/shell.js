import { runApp, getAppLog } from '@/api/applications'

function runFinished(vueComp) {
  vueComp.index = -1;
  if (vueComp.timer) {
    clearInterval(vueComp.timer);
    vueComp.timer = null;
  }
  vueComp.input = '';
  vueComp.inputDisabled = false;
  let shell = vueComp.$refs['shell_div'];
  vueComp.$nextTick(() => {
    shell.scrollTop = shell.scrollHeight;
    vueComp.$refs["input"].focus();
  });
}
function refreshShellContents(vueComp, content) {
  let command = vueComp.input;
  command = command.replace(/^ +/g, "");
  if (command.indexOf("cd ") == 0) {
    vueComp.shellApp.working_dir = content;
  }
  if (typeof (content) == 'object') {
    vueComp.shellContents.push({
      type: "json",
      content: content
    });
    return;
  }
  content = content + "";
  if (content.indexOf("ls:") !== 0 && (command.indexOf("ls ") == 0 || command == "ls")) {
    let dir = vueComp.shellApp.working_dir;
    let tmpCommand = command;
    if (command != "ls") {
      tmpCommand = tmpCommand.replace(/ -[a-z]/g, ' ').replace(/ls /g, '').replace(' ', '');
      if (tmpCommand.indexOf("/") == 0) {
        dir = tmpCommand;
      } else {
        dir += "/" + tmpCommand;
      }
    }

    let contentList = content.split(/[\n\r]/g);
    contentList[contentList.length - 1].length == 0 ? contentList.pop() : "";
    contentList.map((item, index) => {
      let fileName = item;
      if (command.indexOf(" -l") > 0) {
        fileName = item.substring(item.lastIndexOf(" ") + 1);
      }
      if (command.indexOf(" -l") > 0 && index === 0) {
        vueComp.shellContents.push({
          content: item
        });
      } else {
        vueComp.shellContents.push({
          content: item,
          dir: dir,
          fileName: fileName,
          type: "file"
        });
      }
    });
  } else {
    vueComp.shellContents.push({
      content: content
    });
  }


  let shell = vueComp.$refs['shell_div'];
  vueComp.$nextTick(() => {
    shell.scrollTop = shell.scrollHeight;
  });
}
function getOutputValue(vueComp, data) {
  getAppLog(data.name, 0, vueComp.outputPosition, data.process_uuid).then((res) => {
    // console.log(res.headers)
    // use lowercase header key here!!!
    // https://stackoverflow.com/questions/63112580/upper-case-converted-to-lower-case-when-reading-response-header-in-node-express
    if (Object.prototype.hasOwnProperty.call(res.headers, 'exit-code')) {
      runFinished(vueComp);
    }
    if (res.data != "") {
      vueComp.outputPosition = res.headers['output-position']
      refreshShellContents(vueComp, res.data);
    }
  }, (res) => {
    vueComp.shellContents.push({
      content: "# Failed: " + res.message
    });
    runFinished(vueComp);
  });
}
export default {
  connectHost: function (vueComp) {
    vueComp.connected = 1;
    vueComp.shellApp.command = '""';
    runApp(vueComp.timeout, true, vueComp.shellApp).then((res) => {
      vueComp.connected = 2;
      runFinished(vueComp);
    }, (res) => {
      vueComp.connected = 0;
      vueComp.shellContents.push(
        {
          content: "# Connected remote host failed."
        }
      );
    });
  },
  run: function (vueComp) {
    let command = vueComp.input;
    command = command.replace(/^ +/g, "");
    if (command.indexOf("cd ") == 0) {
      command = command + ";pwd";
    }
    vueComp.shellApp.command = command;
    let shell = vueComp.$refs['shell_div'];
    vueComp.$nextTick(() => {
      shell.scrollTop = shell.scrollHeight;
    });
    runApp(vueComp.timeout, vueComp.isSync, vueComp.shellApp).then((res) => {
      if (vueComp.isSync) {
        refreshShellContents(vueComp, res.data);
        runFinished(vueComp);
      } else {
        vueComp.outputPosition = "0"
        vueComp.timer = setInterval(() => {
          getOutputValue(vueComp, res.data);
        }, 1000);
      }
    }, (res) => {
      vueComp.shellContents.push({
        content: "# Failed: " + res.message
      });
      runFinished(vueComp);
    });
  },

}
