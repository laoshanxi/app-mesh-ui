import path from 'path'
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

// Shell syntax whose output we cannot map back to paths.
const SHELL_METACHARACTERS = /[|&;<>()`$]/;
// A short-flag cluster whose output cannot be read as "one name per line under
// one directory": packed layouts (-C/-x/-m), recursion (-R, whose subdirectory
// entries would be resolved against the top-level operand), type indicators and
// re-quoting (-F/-p/-b/-Q), printing the operand itself (-d), and options that
// swallow the following token (-I/-T/-w), which would leave it looking like an
// operand. Digits are legal inside a cluster (-1l, -la1). -i and -s are handled
// separately because they only break short format.
const LS_UNSAFE_FLAG = /^-[a-zA-Z0-9]*[CxmbFpQdIRTw][a-zA-Z0-9]*$/;
// The long spellings of the same, plus anything that colourises or hyperlinks a
// name and the options that print help or a version instead of a listing.
const LS_UNSAFE_LONG = /^--(classify|file-type|escape|quote-name|quoting-style|indicator-style|color|hyperlink|recursive|directory|ignore|tabsize|width|help|version|format=(columns|horizontal|commas))(=.*)?$/;
const LS_LONG_FLAG = /^-[a-zA-Z0-9]*l[a-zA-Z0-9]*$/;
// -i and -s prepend a numeric column. Long format exposes it as a leading field
// that can be skipped; short format gives no way to separate it from the name.
const LS_NUMERIC_COLUMN = /^-[a-zA-Z0-9]*[is][a-zA-Z0-9]*$/;
const LS_PERMS = /^[-dlbcps][rwxsStT-]{9}[.+@]?$/;
const LS_WORD_FIELD = /^[^\d\s]+$/;
const LS_CLOCK_OR_YEAR = /^(\d{1,2}:\d{2}|\d{4})$/;

// Split a command line into tokens, honoring quotes and backslash escapes.
// Returns null when the line uses shell syntax we cannot reason about; callers
// then keep the output plain and non-clickable rather than guess a wrong path.
function tokenizeCommand(command) {
  if (SHELL_METACHARACTERS.test(command)) return null;
  const tokens = [];
  let current = "";
  let started = false;
  for (let i = 0; i < command.length; i++) {
    const ch = command[i];
    if (ch === "'" || ch === '"') {
      const end = command.indexOf(ch, i + 1);
      if (end === -1) return null;
      current += command.slice(i + 1, end);
      i = end;
      started = true;
    } else if (ch === "\\") {
      if (i + 1 >= command.length) return null;
      current += command[++i];
      started = true;
    } else if (/\s/.test(ch)) {
      if (started) tokens.push(current);
      current = "";
      started = false;
    } else {
      current += ch;
      started = true;
    }
  }
  if (started) tokens.push(current);
  return tokens;
}

// Parse "ls ..." into its layout and the single operand it lists. Returns null
// when the flags or operands make the entries ambiguous: several directories
// interleave headers, globs and ~ are expanded remotely, and packed or
// decorated output cannot be read back as one path per line.
function parseLsCommand(command) {
  const tokens = tokenizeCommand(command);
  if (!tokens || tokens[0] !== "ls") return null;

  let longFormat = false;
  let numericColumn = false;
  let endOfFlags = false;
  const operands = [];
  for (const token of tokens.slice(1)) {
    if (endOfFlags) {
      operands.push(token);
    } else if (token === "--") {
      endOfFlags = true;
    } else if (token.startsWith("-") && token.length > 1) {
      if (LS_UNSAFE_FLAG.test(token) || LS_UNSAFE_LONG.test(token)) return null;
      if (token === "--format=long" || LS_LONG_FLAG.test(token)) longFormat = true;
      if (LS_NUMERIC_COLUMN.test(token)) numericColumn = true;
    } else {
      operands.push(token);
    }
  }
  if (numericColumn && !longFormat) return null;
  if (operands.length > 1) return null;
  const operand = operands[0];
  if (operand && (/[*?[{]/.test(operand) || operand.startsWith("~"))) return null;
  return { longFormat, operand };
}

// The directory the listed names live in. Without a tty ls prints one entry per
// line, so a bare name is relative to the tracked working directory.
function resolveLsDir(workingDir, operand) {
  const base = workingDir || ".";
  if (!operand || operand === ".") return base;
  const resolved = operand.startsWith("/") ? path.posix.normalize(operand) : path.posix.join(base, operand);
  return resolved.length > 1 ? resolved.replace(/\/+$/, "") : resolved;
}

function splitFields(line) {
  const fields = [];
  const re = /\S+/g;
  let match;
  while ((match = re.exec(line)) !== null) fields.push({ value: match[0], start: match.index });
  return fields;
}

// Long format is "<perms> <links> <owner> <group> [<size>] <month> <day> <time> <name>",
// where -s may prepend a block count and -g/-o drop owner or group. Anchoring on
// the date fields and taking the rest of the line keeps spaces in names intact;
// a line that does not match the shape stays plain text. Returns null when unreadable.
function parseLongFormatLine(line) {
  const fields = splitFields(line);
  const permsOffset = fields.findIndex((field, index) => index <= 1 && LS_PERMS.test(field.value));
  if (permsOffset === -1) return null;
  const isSymlink = fields[permsOffset].value.startsWith("l");
  for (let i = permsOffset + 4; i <= permsOffset + 6 && i + 3 < fields.length; i++) {
    if (!LS_WORD_FIELD.test(fields[i].value)) continue;
    if (!/^\d{1,2}$/.test(fields[i + 1].value)) continue;
    if (!LS_CLOCK_OR_YEAR.test(fields[i + 2].value)) continue;
    // Everything from the name field on belongs to the name, kept verbatim so
    // spaces survive. Only a symlink carries " -> target" — in a regular file
    // the arrow is part of the name.
    const name = line.slice(fields[i + 3].start);
    const arrow = name.indexOf(" -> ");
    return isSymlink && arrow !== -1 ? name.slice(0, arrow) : name;
  }
  return null;
}

function refreshShellContents(vueComp, content, command) {
  if (command.startsWith("cd ")) {
    const path = String(content).trim();
    if (path.startsWith("/") && !/[\r\n]/.test(path)) {
      vueComp.shellApp.working_dir = path;
    }
  }
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch (e) {
      // not JSON, keep the raw text
    }
  }
  if (typeof content === 'object' && content !== null) {
    vueComp.shellContents.push({ type: "json", content });
    vueComp.$nextTick(() => {
      const shell = vueComp.$refs['shell_div'];
      if (!shell) return;
      shell.scrollTop = shell.scrollHeight;
      // json-viewer renders its tree asynchronously; scroll again once it settles
      setTimeout(() => { shell.scrollTop = shell.scrollHeight; }, 50);
    });
    return;
  }
  content = String(content);
  const ls = parseLsCommand(command);
  if (ls) {
    const lines = content.split(/\r?\n/);
    if (lines[lines.length - 1] === "") lines.pop();
    // stderr shares the stdout handle, so an ls error must stay plain text.
    if (lines.some((line) => /^ls:\s/.test(line))) {
      vueComp.shellContents.push({ content });
    } else {
      const dir = resolveLsDir(vueComp.shellApp.working_dir, ls.operand);
      lines.forEach((line) => {
        if (line.trim() === "") return;
        const fileName = ls.longFormat ? parseLongFormatLine(line) : line;
        if (fileName) {
          vueComp.shellContents.push({ content: line, dir, fileName, type: "file" });
        } else {
          vueComp.shellContents.push({ content: line });
        }
      });
    }
  } else {
    vueComp.shellContents.push({ content });
  }

  vueComp.$nextTick(() => {
    const shell = vueComp.$refs['shell_div'];
    if (shell) shell.scrollTop = shell.scrollHeight;
  });
}

// Each run gets its own app name. When no app of that name exists the daemon
// registers the on-demand run under it verbatim, which is the only handle
// Ctrl+C has on a sync run — the sync response never reveals an app name.
// Names must stay within [a-zA-Z0-9_-] (see normalizeAppName in the daemon);
// a collision would be rejected outright rather than run the wrong app.
function nextRunAppName() {
  return "uishell-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

export default {
  connectHost: function (vueComp) {
    vueComp.connected = 1;
    vueComp.shellApp.name = nextRunAppName();
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
    // Kept as typed: the ls parser and the cd probe read this, not the ";pwd"
    // probe appended below. Re-reading the live input box instead would break
    // both if the user cleared the screen while the command was still running.
    const rawCommand = vueComp.input.replace(/^ +/g, "");
    let command = rawCommand;
    if (command.startsWith("cd ")) {
      command = command + ";pwd";
    }
    vueComp.shellApp.command = command;
    vueComp.shellApp.name = nextRunAppName();
    vueComp.runningApp = vueComp.shellApp.name;
    vueComp.stopped = false;
    // Identifies this run so a request abandoned by stop() cannot report into a
    // later one when it eventually settles on its own.
    const runToken = {};
    vueComp.runToken = runToken;
    const ownedByThisRun = () => vueComp.runToken === runToken;
    vueComp.$nextTick(() => {
      const shell = vueComp.$refs['shell_div'];
      if (shell) shell.scrollTop = shell.scrollHeight;
    });

    // The SDK invokes this callback directly, so it needs the same guard: a
    // request abandoned by stop() can still resolve later and would otherwise
    // print its output under "# Terminated" or into a later run.
    const outputHandler = (output) => {
      if (ownedByThisRun()) refreshShellContents(vueComp, output, rawCommand);
    };
    const failed = (error) => outputHandler("# Failed: " + error.message);
    const settled = () => {
      if (!ownedByThisRun()) return;
      vueComp.runningApp = "";
      vueComp.stopped = false;
      runFinished(vueComp);
    };

    if (vueComp.isSync) {
      getClient().run_app_sync(vueComp.shellApp, outputHandler, vueComp.timeout)
        .catch(failed)
        .finally(settled);
    } else {
      getClient().run_app_async(vueComp.shellApp, vueComp.timeout)
        .then((run) => {
          // A create response that lands after stop() belongs to a run the user
          // already stopped. Adopting its name would point the next Ctrl+C at
          // that dead app while the live run keeps going.
          if (!ownedByThisRun()) return;
          // The daemon echoes the client-provided name; keep whichever it reports.
          vueComp.runningApp = run.appName;
          return run.wait(outputHandler);
        })
        .catch(failed)
        .finally(settled);
    }
  },
  // Terminate the running command by deleting its on-demand app, which stops
  // every process in the run. Works for both modes because the run always
  // carries a client-provided name. Deleting the app also strands the in-flight
  // request — the daemon never answers a syncrun whose app was removed under it
  // — so the console is released here rather than waiting for that reply.
  stop: function (vueComp) {
    const appName = vueComp.runningApp;
    if (!appName || vueComp.stopped) return false;
    vueComp.stopped = true;
    vueComp.runToken = null;
    // Ctrl+C can land inside the create round trip, before the daemon has
    // registered the app — the delete would 404 and the command would keep
    // running while the console claims otherwise. Retry briefly to close that
    // window; once the app is gone every later attempt just 404s again.
    const removeApp = (attempt) => {
      getClient()
        .delete_app(appName)
        .then((removed) => {
          if (!removed && attempt < 5) setTimeout(() => removeApp(attempt + 1), 120);
        })
        .catch(() => {
          // The run may have finished and removed itself first; nothing to do.
        });
    };
    removeApp(0);
    vueComp.shellContents.push({ content: "# Terminated" });
    vueComp.$nextTick(() => {
      const shell = vueComp.$refs['shell_div'];
      if (shell) shell.scrollTop = shell.scrollHeight;
    });
    runFinished(vueComp);
    return true;
  },
}
