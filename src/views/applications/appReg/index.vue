<template>
  <div>
    <!-- {{ form }} -->
    <el-card shadow="never" class="register-card">
      <el-form :model="registerForm" ref="regForm" :rules="regRules" label-width="160px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="registerForm.name"></el-input>
        </el-form-item>
        <el-form-item label="Command line" prop="command">
          <el-input v-model="registerForm.command"></el-input>
        </el-form-item>
        <el-form-item label="Shell mode" prop="shell_mode">
          <el-switch v-model="registerForm.shell_mode" :active-value="true" :inactive-value="false"></el-switch>
        </el-form-item>

        <el-form-item label="Working dir" prop="working_dir">
          <el-input v-model="registerForm.working_dir"></el-input>
        </el-form-item>

        <el-form-item label="Status">
          <el-switch
            v-model="registerForm.status"
            active-text="Enabled"
            :active-value="1"
            inactive-text="Disabled"
            :inactive-value="0"
          ></el-switch>
        </el-form-item>

        <el-form-item label="Permission">
          <el-row>
            <el-col :span="2">Group:</el-col>
            <el-col :span="22">
              <el-radio-group v-model="registerForm.groupPermission">
                <!-- <el-radio-button label="0">All</el-radio-button> -->
                <el-radio-button label="1">Deny</el-radio-button>
                <el-radio-button label="2">Read</el-radio-button>
                <el-radio-button label="3">Write</el-radio-button>
              </el-radio-group>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="2">Other:</el-col>
            <el-col :span="22">
              <el-radio-group v-model="registerForm.otherPermission">
                <!-- <el-radio-button label="0">All</el-radio-button> -->
                <el-radio-button label="1">Deny</el-radio-button>
                <el-radio-button label="2">Read</el-radio-button>
                <el-radio-button label="3">Write</el-radio-button>
              </el-radio-group>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="Metadata" prop="metadata">
          <el-input v-model="registerForm.metadata"></el-input>
        </el-form-item>

        <el-form-item label="stdout cache number" prop="stdout_cache_num">
          <el-input-number :min="0" v-model="registerForm.stdout_cache_num"></el-input-number>
        </el-form-item>

        <el-divider></el-divider>

        <el-form-item label="Init cmd" prop="init_command">
          <el-input v-model="registerForm.init_command"></el-input>
        </el-form-item>
        <el-form-item label="Finish cmd" prop="fini_command">
          <el-input v-model="registerForm.fini_command"></el-input>
        </el-form-item>
        <el-form-item label="Healthcheck cmd" prop="health_check_cmd">
          <el-input v-model="registerForm.health_check_cmd"></el-input>
        </el-form-item>

        <el-divider></el-divider>

        <el-form-item label="Start interval" prop="start_interval_seconds">
          <el-input v-model="registerForm.start_interval_seconds"></el-input>(ISO 8601 durations or seconds)
        </el-form-item>
        <el-form-item label="Start interval timeout" prop="start_interval_timeout">
          <el-input v-model="registerForm.start_interval_timeout"></el-input>(ISO 8601 durations or seconds)
        </el-form-item>
        <el-form-item label="Keep running" prop="keep_running">
          <el-switch
            v-model="registerForm.keep_running"
            :active-value="true"
            :inactive-value="false"
          ></el-switch>
        </el-form-item>

        <el-divider></el-divider>

        <el-form-item label="Start time" prop="start_time">
          <el-date-picker
            v-model="registerForm.start_time"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetime"
            placeholder
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="End time" prop="end_time">
          <el-date-picker
            v-model="registerForm.end_time"
            value-format="yyyy-MM-dd HH:mm:ss"
            type="datetime"
            placeholder
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="Daily limitation">
          <el-time-picker
            is-range
            v-model="daily_time_range"
            range-separator="-"
            value-format="HH:mm:ss"
            start-placeholder="Start time"
            end-placeholder="End time"
          ></el-time-picker>
        </el-form-item>
        <el-form-item label="Posix timezone" prop="posix_timezone">
          <el-input v-model="registerForm.posix_timezone"></el-input>
        </el-form-item>
        <el-divider></el-divider>

        <el-form-item label="CPU shares" prop="resource_limit.cpu_shares">
          <el-input-number :min="0" v-model="registerForm.resource_limit.cpu_shares"></el-input-number>
        </el-form-item>
        <el-form-item label="Physical memory" prop="resource_limit.memory_mb">
          <el-input-number :min="0" v-model="registerForm.resource_limit.memory_mb"></el-input-number>Mi
        </el-form-item>
        <el-form-item label="Virtual memory" prop="resource_limit.memory_virt_mb">
          <el-input-number :min="0" v-model="registerForm.resource_limit.memory_virt_mb"></el-input-number>Mi
        </el-form-item>
        <el-divider></el-divider>

        <el-form-item label="Pid(for attach)" prop="pid">
          <el-input-number :min="0" v-model="registerForm.pid"></el-input-number>
        </el-form-item>

        <el-divider></el-divider>
        <el-form-item label="Docker image" prop="docker_image">
          <el-input v-model="registerForm.docker_image"></el-input>
        </el-form-item>
        <el-form-item label="Docker options" prop="APP_DOCKER_OPTS">
          <el-input v-model="registerForm.APP_DOCKER_OPTS"></el-input>
        </el-form-item>
        <el-form-item label="Image pull timeout" prop="APP_DOCKER_IMG_PULL_TIMEOUT">
          <el-input-number :min="0" v-model="registerForm.APP_DOCKER_IMG_PULL_TIMEOUT"></el-input-number>S
        </el-form-item>

        <el-divider></el-divider>

        <el-form-item
          v-for="(env, index) in registerForm.envs"
          :label="'Env ' + index"
          :key="env.key"
          :prop="'envs.' + index + '.value'"
          :rules="{
            required: true,
            message: 'ENV is not empty',
            trigger: 'blur'
          }"
        >
          <el-input v-model="env.name" ref="envs" style="width:200px"></el-input>=
          <el-input v-model="env.value" style="width:200px"></el-input>
          <el-button @click.prevent="removeEnvReg(env)" icon="el-icon-delete"></el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <div class="dialog-footer">
      <el-button @click="cancel()">Cancel</el-button>
      <el-button @click="reset()">Reset</el-button>
      <el-button @click="addEnvReg()">Add Env</el-button>
      <el-button type="primary" @click="registerApp()">Save</el-button>
    </div>
  </div>
</template>

<script>
import applications from "@/services/applications";

export default {
  name: "AppReg",
  data() {
    return {
      daily_time_range: null,
      initRegisterForm: null,
      registerForm: {},
      regRules: {
        name: [
          { required: true, message: "Name is not empty", trigger: "blur" },
        ],
        start_interval_seconds: [
          {
            pattern: /^P((([0-9]+Y)?([0-9]+M)?([0-9]+D)?(T([0-9]+H)?([0-9]+M)?([0-9]+S)?)?)|([0-9]+W))$/g,
            message: "Start interval seconds is invalid.",
            trigger: "blur",
          },
        ],
        start_interval_timeout: [
          {
            pattern: /^P((([0-9]+Y)?([0-9]+M)?([0-9]+D)?(T([0-9]+H)?([0-9]+M)?([0-9]+S)?)?)|([0-9]+W))$/g,
            message: "Start interval timeout seconds is invalid.",
            trigger: "blur",
          },
        ],
      },
    };
  },
  props: ["propForm"],
  created() {
    this.resetForm();
    this.setFromWithProps();
  },
  mounted() {},
  watch: {
    propForm: {
      handler: function (val, old) {
        if (val === old) {
          return;
        }

        this.setFromWithProps();
      },
      immediate: false,
    },
  },
  methods: {
    setFromWithProps() {
      this.registerForm.env = [];
      if (Object.keys(this.propForm).length !== 0) {
        this.registerForm = this.merge(this.$clone(this.propForm), this.registerForm);
        let permission = this.registerForm.permission + "";
        this.registerForm.otherPermission =
          permission.length == 2 ? permission.substring(0, 1) : 3;
        this.registerForm.groupPermission =
          permission.length == 2 ? permission.substring(1, 2) : 3;
        if(this.registerForm.daily_limitation){
          this.daily_time_range = [this.registerForm.daily_limitation.daily_start, this.registerForm.daily_limitation.daily_end];
        }else{
          this.daily_time_range = null;
        }
        if(this.registerForm.env){
          this.registerForm.envs = [];
          for(let env in this.registerForm.env){
            this.registerForm.envs.push({
              key: env,
              name: env,
              value: this.registerForm.env[env]
            });
          }
        }
      } else {
        this.resetForm();
      }
    },
    resetForm() {
      this.daily_time_range = null;
      this.registerForm = {
        name: "",
        command: "",
        working_dir: "",
        shell_mode: false,
        permission: null,
        otherPermission: 3,
        groupPermission: 3,
        metadata: "",
        stdout_cache_num: 0,
        status: 1, //0 disabled, 1 enabled
        daily_limitation: {
          daily_start: "",
          daily_end: "",
        },
        resource_limit: {
          cpu_shares: null,
          memory_mb: null,
          memory_virt_mb: null,
        },
        APP_DOCKER_IMG_PULL_TIMEOUT: null,
        APP_DOCKER_OPTS: "",
        envs: [],
        posix_timezone: "",
        docker_image: "",
        pid: null,

        start_interval_seconds: null,
        start_time: "",
        start_interval_timeout: null,

        keep_running: false, //0 no, 1 yes
      };
    },
    cancel() {
      this.$emit("close");
    },
    reset() {
      this.setFromWithProps();
    },
    addEnvReg() {
      this.registerForm.envs.push({
        name: "",
        value: "",
        key: Date.now(),
      });
      setTimeout(() => {
        this.$refs["envs"][this.registerForm.envs.length - 1].focus();
      }, 100);
    },
    removeEnvReg(item) {
      var index = this.registerForm.envs.indexOf(item);
      if (index !== -1) {
        this.registerForm.envs.splice(index, 1);
      }
    },
    registerApp() {
      let other = this.registerForm.otherPermission
        ? this.registerForm.otherPermission + ""
        : "3";
      let group = this.registerForm.groupPermission
        ? this.registerForm.groupPermission + ""
        : "3";
      this.registerForm.permission = other + group;
      applications.registerApp(this);
    },

    merge(local, origin) {
      for (var key in local) {
        origin[key] =
          origin[key] && origin[key].toString() === "[object Object]"
            ? this.merge(local[key], origin[key])
            : (origin[key] = local[key]);
      }
      return origin;
    },
  },
};
</script>

<style scoped>
.register-card {
  height: calc(100vh - 136px) !important;
  overflow-y: auto;
}
.register-card .el-input,
.register-card .el-input-number {
  width: 350px;
  margin-right: 10px;
}
.right-drawer .dialog-footer {
  border-top: 1px solid #bfcbd9;
  background-color: #ffffff;
  width: 100%;
  position: absolute;
  bottom: 0px;
  text-align: right;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-right: 30px;
}
.detail-card {
  height: calc(100vh - 77px) !important;
  overflow-y: auto;
}
</style>
