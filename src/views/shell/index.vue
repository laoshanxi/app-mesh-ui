<template>
  <el-card
    v-loading="loading"
    element-loading-text="Downloading"
    @keyup.native="clearScreenByKeyUp"
    @keydown.native="clearScreenByKeyDown"
  >
    <el-row slot="header">
      <el-col :span="3" style="text-align: center;height: 38px; line-height: 38px;">
        <el-switch v-model="isSync" active-text="Sync" inactive-text="Async"></el-switch>
      </el-col>
      <el-col :span="2" style="text-align: center;height: 38px; line-height: 38px;">Timeout</el-col>
      <el-col :span="10">
        <el-slider v-model="timeout" :min="5" :max="60" show-input :marks="marks"></el-slider>
      </el-col>
      <el-col :span="9"></el-col>
    </el-row>
    <div class="shell-div" ref="shell_div" @click="moveFocus">
      <el-button-group class="buttonsArea">
        <i class="el-icon-delete" @click="clearScreen"></i>
      </el-button-group>
      <div class="shell-content">
        <div v-for="line in shellContents" class="shell-line">
          <pre v-if="line.type == 'file'" class="file" @click="download(line)">{{line.content}}</pre>
          <json-viewer
          boxed theme="my-awesome-json-theme"
          v-else-if="line.type == 'json'"
          :value="line.content"
          style="line-height: 18px">
          </json-viewer>
          <pre v-else :class="{'command':line.type=='command'}">{{line.content}}</pre>
        </div>
      </div>
      <div class="shell-command">
        <el-button v-if="connected==0" @click.stop="connectHost()">Re-connect</el-button>

        <el-input
          ref="input"
          :disabled="inputDisabled"
          v-if="connected==2"
          class="shell-input"
          v-model="input"
          @keyup.enter.native="runShell()"
          @keyup.up.native="upCommand"
          @keyup.down.native="downCommand"
          placeholder="Please enter a command"
        >
          <template slot="prepend">
            <pre># </pre>
          </template>
        </el-input>
      </div>
    </div>
  </el-card>
</template>

<script>
import shellService from "@/services/shell";
import fileService from "@/services/file";

export default {
  name: "Shell",
  data() {
    return {
      loading: false,
      timeout: 10,
      control: false,
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
      shellApp: {
        command: "",
        shell_mode: true,
        working_dir: "/tmp",
      },
      connected: 0, //0,not-connected；1，connecting；2，connected
    };
  },
  created() {},
  components: {},
  destroyed() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  mounted() {
    this.connectHost();
  },
  methods: {
    clearScreen() {
      this.shellContents = [];
      this.input = "";
    },
    clearScreenByKeyDown(e) {
      if (e.key == "Control") {
        this.control = true;
      } else if (this.control && e.key == "c") {
        this.clearScreen();
      }
    },
    clearScreenByKeyUp(e) {
      if (e.key == "Control") {
        this.control = false;
      }
    },
    moveFocus() {
      this.$refs["input"].focus();
    },
    upCommand() {
      if (this.commands.length == 0) {
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
      if (this.commands.length == 0) {
        return;
      }
      if (this.index > -1 && this.index < this.commands.length - 1) {
        this.index++;
      }
      this.input = this.commands[this.index];
      return;
    },
    connectHost() {
      shellService.connectHost(this);
    },
    runShell() {
      this.commands.push(this.input);
      this.shellContents.push({
        content: "# " + this.input,
        type: "command",
      });
      this.inputDisabled = true;
      shellService.run(this);
    },
    async download(obj) {
      await fileService.downloadFile(this, obj.dir.trim() + "/" + obj.fileName);
    },
  },
};
</script>

<style>
.shell-input,
.shell-input > div,
.shell-input > input {
  border: 0px !important;
  margin: 0px !important;
  padding: 0px !important;
  background-color: #001528 !important;
  color: #889aa4;
}
</style>
<style scoped>
.buttonsArea {
  position: absolute;
  right: 35px;
  padding: 10px;
}
.buttonsArea i {
  cursor: pointer;
}
.shell-div {
  overflow: auto;
  width: 100%;
  height: calc(100vh - 92px - 75px);
  background-color: #001528;
  color: #bfcbd9;
}
.shell-command {
  padding: 0px 10px 10px 10px;
  line-height: 24px;
  width: 100%;
  height: 50px;
  background-color: #001528;
  color: #bfcbd9;
}
.shell-content {
  padding: 10px 10px 0px 10px;
  line-height: 24px;
  width: 100%;
  background-color: #001528;
  color: #bfcbd9;
}
.shell-line > pre {
  margin: 0px;
}

.shell-line > .command {
  color: #67c23a;
}
.shell-line > .file {
  color: #67c23a;
  cursor: pointer;
}

</style>
<style lang="scss">
.my-awesome-json-theme.boxed { border-color: #1B2948;}
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
  
  .jv-container.jv-button { color: #49b3ff }
  .jv-container.jv-key { color: #999 }
  .jv-item {
    &.jv-array { color: #999 }
    &.jv-boolean { color: #fc1e70 }
    &.jv-function { color: #067bca }
    &.jv-number { color: #fc1e70 }
    &.jv-number-float { color: #fc1e70 }
    &.jv-number-integer { color: #fc1e70 }
    &.jv-object { color: #999 }
    &.jv-undefined { color: #e08331 }
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
