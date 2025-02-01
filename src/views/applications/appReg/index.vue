<template>
  <div>
    <!-- {{ form }} -->
    <el-card shadow="never" class="register-card">
      <el-form ref="regForm" :model="registerForm" :rules="regRules" label-width="160px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="registerForm.name"></el-input>
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="registerForm.description"></el-input>
        </el-form-item>
        <el-form-item label="Command line" prop="command">
          <el-input v-model="registerForm.command"></el-input>
        </el-form-item>
        <el-form-item label="Shell mode" prop="shell">
          <el-switch v-model="registerForm.shell" :active-value="true" :inactive-value="false"></el-switch>
        </el-form-item>
        <el-form-item label="Session login" prop="session_login">
          <el-switch v-model="registerForm.session_login" :active-value="true" :inactive-value="false"></el-switch>
        </el-form-item>

        <el-form-item label="Working dir" prop="working_dir">
          <el-input v-model="registerForm.working_dir"></el-input>
        </el-form-item>

        <el-form-item label="Status">
          <el-switch
            v-model="registerForm.status" active-text="Enabled" :active-value="1" inactive-text="Disabled"
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
        <el-form-item label="stdout cache number" prop="stdout_cache_num">
          <el-input-number v-model="registerForm.stdout_cache_num" :min="0"></el-input-number>
        </el-form-item>

        <el-divider></el-divider>

        <el-form-item label="Metadata" prop="metadata">
          <el-input v-model="registerForm.metadata" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" />
        </el-form-item>
        <el-form-item label="Healthcheck cmd" prop="health_check_cmd">
          <el-input v-model="registerForm.health_check_cmd"></el-input>
        </el-form-item>

        <el-divider></el-divider>

        <el-form-item label="Start interval" prop="start_interval_seconds">
          <el-input v-model="registerForm.start_interval_seconds"></el-input>(ISO 8601 durations / seconds / cron expr)
        </el-form-item>
        <el-form-item label="Cron interval expr" prop="cron">
          <el-switch v-model="registerForm.cron" :active-value="true" :inactive-value="false"></el-switch>
        </el-form-item>
        <el-form-item label="Retention" prop="retention">
          <el-input v-model="registerForm.retention"></el-input>(ISO 8601 durations or seconds)
        </el-form-item>
        <el-form-item label="Exit behavior" prop="behavior.exit">
          <el-select v-model="registerForm.behavior.exit" placeholder="Please select">
            <el-option v-for="item in Behaviors" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-divider></el-divider>

        <el-form-item label="Start time" prop="start_time">
          <el-date-picker
            v-model="registerForm.start_time_TEXT" value-format="yyyy-MM-dd HH:mm:ss" type="datetime"
            placeholder
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="End time" prop="end_time">
          <el-date-picker
            v-model="registerForm.end_time_TEXT" value-format="yyyy-MM-dd HH:mm:ss" type="datetime"
            placeholder
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="Daily limitation">
          <el-time-picker
            v-model="daily_time_range" is-range :value="daily_time_range" range-separator="-"
            value-format="HH:mm:ss" start-placeholder="Start time" end-placeholder="End time" @change="onDailyTimeChange"
          >
          </el-time-picker>
        </el-form-item>
        <el-divider></el-divider>

        <el-form-item label="CPU shares" prop="resource_limit.cpu_shares">
          <el-input-number v-model="registerForm.resource_limit.cpu_shares" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="Physical memory" prop="resource_limit.memory_mb">
          <el-input-number v-model="registerForm.resource_limit.memory_mb" :min="0"></el-input-number>Mi
        </el-form-item>
        <el-form-item label="Virtual memory" prop="resource_limit.memory_virt_mb">
          <el-input-number v-model="registerForm.resource_limit.memory_virt_mb" :min="0"></el-input-number>Mi
        </el-form-item>
        <el-divider></el-divider>

        <el-form-item label="Pid(for attach)" prop="pid">
          <el-input-number v-model="registerForm.pid" :min="0"></el-input-number>
        </el-form-item>

        <el-divider></el-divider>
        <el-form-item label="Docker image" prop="docker_image">
          <el-input v-model="registerForm.docker_image"></el-input>
        </el-form-item>
        <el-form-item label="Docker options" prop="APP_DOCKER_OPTS">
          <el-input v-model="registerForm.APP_DOCKER_OPTS"></el-input>
        </el-form-item>
        <el-form-item label="Image pull timeout" prop="APP_DOCKER_IMG_PULL_TIMEOUT">
          <el-input-number v-model="registerForm.APP_DOCKER_IMG_PULL_TIMEOUT" :min="0"></el-input-number>S
        </el-form-item>

        <el-divider></el-divider>

        <el-form-item
          v-for="(env, index) in registerForm.envs" :key="env.key" :label="'Env ' + index"
          :prop="'envs.' + index + '.value'" :rules="{
            required: true,
            message: 'ENV is not empty',
            trigger: 'blur'
          }"
        >
          <el-input ref="envs" v-model="env.name" style="width:200px"></el-input>=
          <el-input v-model="env.value" style="width:200px"></el-input>
          <el-button icon="el-icon-delete" @click.prevent="removeEnvReg(env)"></el-button>
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
import { formatToLocal, formatToLocalDayTime } from "@/utils";

export default {
  name: "AppReg",
  props: ["propForm"],
  data() {
    return {
      daily_time_range: null,
      initRegisterForm: null,
      registerForm: {},
      regRules: {
        name: [
          { required: true, message: "Name is not empty", trigger: "blur" },
        ],
        start_interval_timeout: [
          {
            pattern: /^P((([0-9]+Y)?([0-9]+M)?([0-9]+D)?(T([0-9]+H)?([0-9]+M)?([0-9]+S)?)?)|([0-9]+W))$/g,
            message: "Start interval timeout seconds is invalid.",
            trigger: "blur",
          },
        ],
      },
      Behaviors: [
        {
          label: "standby",
          value: "standby",
        },
        {
          label: "restart",
          value: "restart",
        },
        {
          label: "keepalive",
          value: "keepalive",
        },
        {
          label: "remove",
          value: "remove",
        },
      ],
    };
  },
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
    daily_time_range: {
      handler: function (newRange) {
        this.onDailyTimeChange(newRange);
      },
      deep: true
    },
  },
  created() {
    this.resetForm();
    this.setFromWithProps();
  },
  mounted() { },
  methods: {
    setFromWithProps() {
      this.resetForm();


      if (Object.keys(this.propForm).length !== 0) {
        this.registerForm = this.merge(this.$clone(this.propForm), this.registerForm);
        let permission = this.registerForm.permission + "";
        this.registerForm.otherPermission = permission.length == 2 ? permission.substring(0, 1) : 3;
        this.registerForm.groupPermission = permission.length == 2 ? permission.substring(1, 2) : 3;
        if (this.registerForm.daily_limitation) {
          this.registerForm.daily_limitation.daily_start_TEXT = formatToLocalDayTime(this.registerForm.daily_limitation.daily_start_TEXT);
          this.registerForm.daily_limitation.daily_end_TEXT = formatToLocalDayTime(this.registerForm.daily_limitation.daily_end_TEXT);
          this.daily_time_range = [this.registerForm.daily_limitation.daily_start_TEXT, this.registerForm.daily_limitation.daily_end_TEXT];
        } else {
          this.daily_time_range = null;
        }
        this.registerForm.start_time_TEXT = formatToLocal(this.registerForm.start_time_TEXT);
        this.registerForm.end_time_TEXT = formatToLocal(this.registerForm.end_time_TEXT);
        if (this.isJsonString(this.registerForm.metadata)) {
          this.registerForm.metadata = JSON.stringify(this.registerForm.metadata, null, 2);
        } else {
          this.registerForm.metadata = this.propForm.metadata;
        }
        if (this.registerForm.env) {
          this.registerForm.envs = [];
          for (let env in this.registerForm.env) {
            this.registerForm.envs.push({
              key: env,
              name: env,
              value: this.registerForm.env[env]
            });
          }
        }
      }
    },
    resetForm() {
      this.daily_time_range = null;
      this.registerForm = {
        name: '',
        description: '',
        command: '',
        working_dir: '',
        shell: false,
        session_login: false,
        permission: null,
        otherPermission: 3,
        groupPermission: 3,
        metadata: '',
        stdout_cache_num: 0,
        status: 1, //0 disabled, 1 enabled
        daily_limitation: {
          daily_start: 0,
          daily_start_TEXT: '',
          daily_end: 0,
          daily_end_TEXT: ''
        },
        resource_limit: {
          cpu_shares: null,
          memory_mb: null,
          memory_virt_mb: null
        },
        APP_DOCKER_IMG_PULL_TIMEOUT: null,
        APP_DOCKER_OPTS: '',
        envs: [],
        docker_image: '',
        pid: null,
        start_interval_seconds: null,
        cron: false,
        start_time: 0,
        start_time_TEXT: '',
        end_time: 0,
        end_time_TEXT: '',
        retention: null,
        behavior: {
          exit: 'standby'
        }
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
    onDailyTimeChange(value) {
      if (value) {
        this.registerForm.daily_limitation.daily_start_TEXT = value[0];
        this.registerForm.daily_limitation.daily_end_TEXT = value[1];
      } else {
        this.registerForm.daily_limitation.daily_start_TEXT = '';
        this.registerForm.daily_limitation.daily_end_TEXT = '';
      }
    },
    registerApp() {
      let other = this.registerForm.otherPermission ? this.registerForm.otherPermission + "" : "3";
      let group = this.registerForm.groupPermission ? this.registerForm.groupPermission + "" : "3";
      this.registerForm.permission = other + group;
      if (this.registerForm.start_time_TEXT && this.registerForm.start_time_TEXT !== "") {
        // convert "2025-01-19 18:06:57" with current browser zone to UTC seconds
        this.registerForm.start_time = Date.parse(this.registerForm.start_time_TEXT) / 1000;
      }
      if (this.registerForm.end_time_TEXT && this.registerForm.end_time_TEXT !== "") {
        // convert "2025-01-19 18:06:57" with current browser zone to UTC seconds
        this.registerForm.end_time = Date.parse(this.registerForm.end_time_TEXT) / 1000;
      }
      if (this.registerForm.daily_limitation.daily_start_TEXT && this.registerForm.daily_limitation.daily_start_TEXT !== "") {
        // convert day time "08:00:00" with current browser zone to UTC seconds
        let fullDateString = `1970-01-02 ${this.registerForm.daily_limitation.daily_start_TEXT}`; // Combine with time (no 'Z' for local time)
        this.registerForm.daily_limitation.daily_start = Date.parse(fullDateString) / 1000; // Convert to seconds
      }
      if (this.registerForm.daily_limitation.daily_end_TEXT && this.registerForm.daily_limitation.daily_end_TEXT !== "") {
        // convert day time "08:00:00" with current browser zone to UTC seconds
        let fullDateString = `1970-01-02 ${this.registerForm.daily_limitation.daily_end_TEXT}`; // Combine with time (no 'Z' for local time)
        this.registerForm.daily_limitation.daily_end = Date.parse(fullDateString) / 1000; // Convert to seconds
      }
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
    isJsonString(str) {
      if (str) {
        try {
          if ((typeof JSON.parse(str)) === "object") {
            return true;
          }
        } catch (e) {
          console.debug('Failed to parse JSON:', e);
        }
        if (Object.prototype.toString.call(str) === "[object Object]") {
          return true;
        }
        return ((typeof str) === "object");
      }
      return false;
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
