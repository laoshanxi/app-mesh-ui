<template>
  <div class="app-container">
    <div class="page-title">Run Shell</div>
    <el-card class="shell-card">
      <template #header>
        <div class="toolbar">
          <el-switch v-model="isSync" active-text="Sync" inactive-text="Async" />
          <span class="t-label">Timeout</span>
          <el-input-number v-model="timeout" :min="5" :max="60" :step="5" controls-position="right" class="t-num" />
          <span class="spacer" />
          <el-button @click="clearScreen">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </template>
      <div ref="shell_div" v-loading="loading" element-loading-text="Downloading" class="shell-div" @click="moveFocus">
        <div class="shell-command">
          <el-button v-if="connected === 0" @click.stop="connectHost()">Re-connect</el-button>

          <el-input
            v-if="connected === 2" ref="input" v-model="input" :disabled="inputDisabled" class="shell-input"
            placeholder="Please enter a command" @keyup.enter="runShell()" @keyup.up="upCommand"
            @keyup.down="downCommand"
          >
            <template #prepend>
              <pre># </pre>
            </template>
          </el-input>
        </div>
        <div class="shell-content">
          <div v-for="(line, lineIndex) in shellContents" :key="lineIndex" class="shell-line">
            <pre v-if="line.type == 'file'" class="file" @click="download(line)">{{ line.content }}</pre>
            <json-viewer
              v-else-if="line.type == 'json'" boxed theme="my-awesome-json-theme" :value="line.content"
              style="line-height: 18px"
            >
            </json-viewer>
            <pre v-else :class="{ 'command': line.type == 'command' }">{{ line.content }}</pre>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import shellService from "@/services/shell";
import fileService from "@/services/file";
import { Delete } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

export default {
  name: "Shell",
  components: { Delete },
  data() {
    return {
      loading: false,
      timeout: 10,
      runningApp: "",
      stopped: false,
      marks: {
        10: "10s",
        20: "20s",
        30: "30s",
        40: "40s",
        50: "50s",
      },
      timer: null,
      shellContents: [],
      commands: [],
      index: -1,
      input: "",
      inputDisabled: false,
      isSync: true,
      outputPosition: "0",
      shellApp: {
        command: "",
        shell: true,
        session_login: true,
      },
      connected: 0, //0,not-connected；1，connecting；2，connected
    };
  },
  created() { },
  unmounted() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    document.removeEventListener("keydown", this.onKeyDown);
  },
  mounted() {
    // Focus leaves the input while a command runs, so the shortcut has to be
    // listened for at the document level to stay reachable.
    document.addEventListener("keydown", this.onKeyDown);
    this.connectHost();
  },
  methods: {
    clearScreen() {
      this.shellContents = [];
      this.input = "";
    },
    onKeyDown(e) {
      if (!e.ctrlKey || e.key.toLowerCase() !== "c") return;
      // Leave Ctrl+C to the browser while text is selected, so copying output
      // is not turned into a kill.
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) return;
      if (this.inputDisabled) {
        e.preventDefault();
        shellService.stop(this);
        return;
      }
      if (this.$refs.shell_div && this.$refs.shell_div.contains(e.target)) {
        e.preventDefault();
        this.clearScreen();
      }
    },
    moveFocus() {
      if (this.$refs["input"]) this.$refs["input"].focus();
    },
    upCommand() {
      if (this.commands.length === 0) {
        return;
      }
      if (this.index == -1) {
        this.index = this.commands.length - 1;
      } else if (this.index > 0) {
        this.index--;
      }
      this.input = this.commands[this.index];
      return;
    },
    downCommand() {
      if (this.commands.length === 0 || this.index === -1) {
        return;
      }
      if (this.index < this.commands.length - 1) {
        this.index++;
        this.input = this.commands[this.index];
        return;
      }
      // Walked past the newest entry: return to an empty prompt, as bash does.
      this.index = -1;
      this.input = "";
    },
    connectHost() {
      shellService.connectHost(this);
    },
    runShell() {
      // Empty input: just echo a fresh prompt, no backend call (like a real shell).
      if (this.input.trim().length === 0) {
        this.shellContents.push({ content: "# " + this.input, type: "command" });
        this.input = "";
        this.$nextTick(() => {
          const shell = this.$refs["shell_div"];
          if (shell) shell.scrollTop = shell.scrollHeight;
        });
        return;
      }
      this.commands.push(this.input);
      this.shellContents.push({
        content: "# " + this.input,
        type: "command",
      });
      this.inputDisabled = true;
      shellService.run(this);
    },
    async download(obj) {
      // dir is "/" when listing the root; dropping the trailing slash keeps the
      // join from producing "//name".
      const dir = obj.dir.replace(/\/+$/, "");
      const filePath = dir + "/" + obj.fileName;
      // The listed name is derived from ls output, so show the path that will
      // actually be fetched before anything is downloaded.
      try {
        await ElMessageBox.confirm(`Download <${filePath}>?`, "Download", {
          type: "info", confirmButtonText: "Download", cancelButtonText: "Cancel",
        });
      } catch {
        return; // dismissed
      }
      await fileService.downloadFile(this, filePath);
    },
  },
};
</script>

<style>
.shell-input {
  width: 100% !important;
}

/* Same face, size and green as the echoed "# command" lines, so the prompt row
   reads as one more line of the session rather than a form field. */
.shell-input .el-input__wrapper,
.shell-input .el-input__inner {
  border: 0px !important;
  box-shadow: none !important;
  margin: 0px !important;
  padding: 0px !important;
  background-color: #001528 !important;
  color: #67c23a;
  font-family: Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  height: 20px;
  line-height: 20px;
}

.shell-input .el-input-group__prepend {
  border: 0px !important;
  box-shadow: none !important;
  background-color: #001528 !important;
  color: #67c23a;
  padding: 0 !important;
}

/* The prepend's <pre> keeps a default 1em margin that drops the prompt below
   the echoed lines it is meant to line up with. */
.shell-input .el-input-group__prepend pre {
  margin: 0 !important;
  font-family: Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 20px;
}
</style>
<style scoped>
/* Fill app-main below the page title (same pattern as the other pages). */
.app-container {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.shell-card {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.shell-card :deep(.el-card__body) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
}

:deep(.el-card__header) {
  padding: 10px 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar .t-num {
  width: 120px;
}

.spacer {
  flex: 1;
}

.t-label {
  color: #909399;
}

/* One monospace face and one line rhythm for the whole console, so the prompt,
   what you type, and the echoed "# command" lines all share a baseline. */
.shell-div {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  width: 100%;
  background-color: #001528;
  color: #bfcbd9;
  font-family: Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 20px;
}

/* Pinned to the top of the scrolling console so the prompt stays reachable
   while output grows underneath it. */
.shell-command {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 10px;
  width: 100%;
  min-height: 40px;
  background-color: #001528;
  color: #bfcbd9;
}

.shell-content {
  padding: 0px 10px 10px 10px;
  width: 100%;
  background-color: #001528;
  color: #bfcbd9;
}

.shell-line>pre {
  margin: 0px;
  white-space: pre-wrap;
  word-break: break-word;
}

.shell-line>.command {
  color: #67c23a;
}

.shell-line>.file {
  color: #67c23a;
  cursor: pointer;
}
</style>
<style lang="scss">
.my-awesome-json-theme.boxed {
  border-color: #1B2948;
}

.my-awesome-json-theme {
  background: #1B2948;
  white-space: nowrap;
  color: #999;
  font-size: 14px;
  font-family: Consolas, Menlo, Courier, monospace;

  .jv-ellipsis {
    color: #999;
    display: inline-block;
    line-height: 0.9;
    font-size: 0.9em;
    padding: 0px 4px 2px 4px;
    border-radius: 3px;
    vertical-align: 2px;
    cursor: pointer;
    user-select: none;
  }

  .jv-container.jv-button {
    color: #49b3ff
  }

  .jv-container.jv-key {
    color: #999
  }

  .jv-item {
    &.jv-array {
      color: #999
    }

    &.jv-boolean {
      color: #fc1e70
    }

    &.jv-function {
      color: #067bca
    }

    &.jv-number {
      color: #fc1e70
    }

    &.jv-number-float {
      color: #fc1e70
    }

    &.jv-number-integer {
      color: #fc1e70
    }

    &.jv-object {
      color: #999
    }

    &.jv-undefined {
      color: #e08331
    }

    &.jv-string {
      color: #42b983;
      word-break: break-word;
      white-space: normal;
    }
  }

  .jv-code {
    .jv-toggle {
      &:before {
        padding: 0px 2px;
        border-radius: 2px;
      }

      &:hover {
        &:before {
          background: #1B2948;
        }
      }
    }
  }
}
</style>
