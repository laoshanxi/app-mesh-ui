<template>
  <div class="reg-wrap">
    <div class="register-card">
      <el-form ref="regForm" :model="registerForm" :rules="regRules" label-width="150px">
        <h3 class="sec-title">Basic</h3>
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

        <el-form-item label="Enabled">
          <el-switch
            v-model="registerForm.enabled" active-text="Enabled" :active-value="true" inactive-text="Disabled"
            :inactive-value="false"
          ></el-switch>
        </el-form-item>

        <el-form-item label="Permission">
          <div class="perm-row">
            <span class="perm-label">Group</span>
            <el-radio-group v-model="registerForm.groupPermission" size="small">
              <el-radio-button value="1">Deny</el-radio-button>
              <el-radio-button value="2">Read</el-radio-button>
              <el-radio-button value="3">Write</el-radio-button>
            </el-radio-group>
          </div>
          <div class="perm-row">
            <span class="perm-label">Other</span>
            <el-radio-group v-model="registerForm.otherPermission" size="small">
              <el-radio-button value="1">Deny</el-radio-button>
              <el-radio-button value="2">Read</el-radio-button>
              <el-radio-button value="3">Write</el-radio-button>
            </el-radio-group>
          </div>
        </el-form-item>
        <el-form-item label="stdout backup count" prop="stdout_backup_count">
          <el-input-number v-model="registerForm.stdout_backup_count" :min="0"></el-input-number>
        </el-form-item>

        <h3 class="sec-title">Metadata &amp; health</h3>

        <el-form-item label="Metadata" prop="metadata">
          <el-input v-model="registerForm.metadata" type="textarea" :autosize="{ minRows: 2, maxRows: 6 }" />
        </el-form-item>
        <el-form-item label="Healthcheck cmd" prop="health_check_cmd">
          <el-input v-model="registerForm.health_check_cmd"></el-input>
        </el-form-item>

        <h3 class="sec-title">Scheduling</h3>

        <el-form-item label="Depends on" prop="depends_on">
          <el-select
            v-model="registerForm.depends_on" multiple filterable allow-create default-first-option
            placeholder="Select or type app names" class="depends-select"
          >
            <el-option v-for="name in appNames" :key="name" :label="name" :value="name"></el-option>
          </el-select><span class="hint">start only after each dependency is healthy</span>
        </el-form-item>
        <el-form-item label="Run interval" prop="interval">
          <el-input v-model="registerForm.interval" @input="onIntervalInput"></el-input><span class="hint">seconds or ISO 8601 duration, e.g. PT5M — exclusive with cron</span>
        </el-form-item>
        <el-form-item label="Cron schedule" prop="cron_schedule">
          <el-input v-model="registerForm.cron_schedule" @input="onCronScheduleInput"></el-input><span class="hint">cron expression, e.g. */5 * * * *</span>
        </el-form-item>
        <el-form-item label="Stop grace period" prop="stop_grace_period">
          <el-input v-model="registerForm.stop_grace_period"></el-input><span class="hint">ISO 8601 durations or seconds</span>
        </el-form-item>
        <el-form-item label="Exit behavior" prop="behavior.exit">
          <el-select v-model="registerForm.behavior.exit" placeholder="Please select">
            <el-option v-for="item in Behaviors" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Exit code actions">
          <div v-for="rule in registerForm.exitCodeActions" :key="rule.key" class="exit-code-row">
            <el-input v-model="rule.code" style="width:120px" placeholder="code"></el-input>
            <el-select v-model="rule.action" style="width:140px">
              <el-option v-for="item in Behaviors" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-button :icon="Delete" @click.prevent="removeExitCodeAction(rule)"></el-button>
          </div>
          <el-button size="small" @click="addExitCodeAction()">Add exit code action</el-button>
          <span class="hint">per exit code; a signal-terminated run reports the signal number</span>
        </el-form-item>
        <h3 class="sec-title">Time window</h3>

        <el-form-item label="Start time" prop="start_time">
          <el-date-picker
            v-model="registerForm.start_time_TEXT" value-format="YYYY-MM-DD HH:mm:ss" type="datetime"
            placeholder
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="End time" prop="end_time">
          <el-date-picker
            v-model="registerForm.end_time_TEXT" value-format="YYYY-MM-DD HH:mm:ss" type="datetime"
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
        <h3 class="sec-title">Resource limits</h3>

        <el-form-item label="CPU shares" prop="resource_limit.cpu_shares">
          <el-input-number v-model="registerForm.resource_limit.cpu_shares" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="Physical memory" prop="resource_limit.memory_mb">
          <el-input-number v-model="registerForm.resource_limit.memory_mb" :min="0"></el-input-number>Mi
        </el-form-item>
        <el-form-item label="Virtual memory" prop="resource_limit.memory_virt_mb">
          <el-input-number v-model="registerForm.resource_limit.memory_virt_mb" :min="0"></el-input-number>Mi
        </el-form-item>
        <h3 class="sec-title">Attach</h3>

        <el-form-item label="Pid(for attach)" prop="pid">
          <el-input-number v-model="registerForm.pid" :min="0"></el-input-number>
        </el-form-item>

        <h3 class="sec-title">Docker</h3>
        <el-form-item label="Docker image" prop="docker_image">
          <el-input v-model="registerForm.docker_image"></el-input>
        </el-form-item>
        <el-form-item label="Docker options" prop="APP_DOCKER_OPTS">
          <el-input v-model="registerForm.APP_DOCKER_OPTS"></el-input>
        </el-form-item>
        <el-form-item label="Image pull timeout" prop="APP_DOCKER_IMG_PULL_TIMEOUT">
          <el-input-number v-model="registerForm.APP_DOCKER_IMG_PULL_TIMEOUT" :min="0"></el-input-number>S
        </el-form-item>

        <h3 class="sec-title">Environment variables</h3>

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
          <el-button :icon="Delete" @click.prevent="removeEnvReg(env)"></el-button>
        </el-form-item>

        <el-form-item
          v-for="(env, index) in registerForm.secretEnvs" :key="env.key" :label="'Secret env ' + index"
        >
          <el-input ref="secretEnvs" v-model="env.name" style="width:200px"></el-input>=
          <el-input v-model="env.value" type="password" show-password style="width:200px"></el-input>
          <el-button :icon="Delete" @click.prevent="removeSecretEnvReg(env)"></el-button>
        </el-form-item>
        <el-alert
          v-if="registerForm.secretEnvs.length" class="secret-note" type="info" :closable="false"
          title="Protected variables are encrypted on save and never shown again; re-enter them on every edit."
        />
      </el-form>
    </div>
    <div class="dialog-footer">
      <el-button @click="cancel()">Cancel</el-button>
      <el-button @click="reset()">Reset</el-button>
      <el-button @click="addEnvReg()">Add Env</el-button>
      <el-button @click="addSecretEnvReg()">Add Secret Env</el-button>
      <el-button type="primary" @click="registerApp()">Save</el-button>
    </div>
  </div>
</template>

<script>
import applications from "@/services/applications";
import { getClient } from "@/utils/appmeshClient";
import { ElMessage } from "element-plus";
import { formatToLocal, formatToLocalDayTime, dayTimeToSeconds, localTimeToSeconds, deepClone } from "@/utils";
import { markRaw } from 'vue'
import { Delete } from "@element-plus/icons-vue";

export default {
  name: "AppReg",
  props: { propForm: { type: Object, default: () => ({}) } },
  emits: ['close', 'success'],
  data() {
    return {
      Delete: markRaw(Delete),
      daily_time_range: null,
      appNames: [],
      initRegisterForm: null,
      registerForm: {},
      regRules: {
        name: [
          { required: true, message: "Name is not empty", trigger: "blur" },
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
    getClient().list_apps().then(
      (data) => { this.appNames = data.map((a) => a.name); },
      () => { /* picker falls back to free-text entry */ }
    );
  },
  methods: {
    setFromWithProps() {
      this.resetForm();


      if (Object.keys(this.propForm).length !== 0) {
        this.registerForm = this.merge(deepClone(this.propForm), this.registerForm);
        let permission = this.registerForm.permission + "";
        this.registerForm.otherPermission = permission.length === 2 ? permission.substring(0, 1) : "3";
        this.registerForm.groupPermission = permission.length === 2 ? permission.substring(1, 2) : "3";
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
        // exit_code_actions object -> editable rows; secret_env is write-only, so it always starts empty on edit
        this.registerForm.exitCodeActions = [];
        const codeActions = this.registerForm.behavior && this.registerForm.behavior.exit_code_actions;
        if (codeActions && typeof codeActions === "object") {
          for (const code in codeActions) {
            this.registerForm.exitCodeActions.push({ key: code, code: code, action: codeActions[code] });
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
        // Strings: the radio buttons bind value="1|2|3", and a numeric default
        // would match none of them, leaving both rows unselected on a new app.
        otherPermission: "3",
        groupPermission: "3",
        metadata: '',
        stdout_backup_count: 0,
        enabled: true,
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
        secretEnvs: [],
        exitCodeActions: [],
        docker_image: '',
        pid: null,
        depends_on: [],
        interval: null,
        cron_schedule: null,
        start_time: 0,
        start_time_TEXT: '',
        end_time: 0,
        end_time_TEXT: '',
        stop_grace_period: null,
        behavior: {
          exit: 'standby'
        }
      };
    },
    // interval and cron_schedule are mutually exclusive on the daemon — clear the other side
    onIntervalInput(value) {
      if (value) this.registerForm.cron_schedule = null;
    },
    onCronScheduleInput(value) {
      if (value) this.registerForm.interval = null;
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
      const index = this.registerForm.envs.indexOf(item);
      if (index !== -1) {
        this.registerForm.envs.splice(index, 1);
      }
    },
    addSecretEnvReg() {
      this.registerForm.secretEnvs.push({
        name: "",
        value: "",
        key: Date.now(),
      });
      setTimeout(() => {
        const refs = this.$refs["secretEnvs"];
        refs[refs.length - 1].focus();
      }, 100);
    },
    removeSecretEnvReg(item) {
      const index = this.registerForm.secretEnvs.indexOf(item);
      if (index !== -1) {
        this.registerForm.secretEnvs.splice(index, 1);
      }
    },
    addExitCodeAction() {
      this.registerForm.exitCodeActions.push({ key: Date.now(), code: "", action: "standby" });
    },
    removeExitCodeAction(item) {
      const index = this.registerForm.exitCodeActions.indexOf(item);
      if (index !== -1) {
        this.registerForm.exitCodeActions.splice(index, 1);
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
      // editable rows -> behavior.exit_code_actions map (string keys, daemon contract)
      const exitCodeActions = {};
      for (const rule of this.registerForm.exitCodeActions) {
        const code = (rule.code || "").trim();
        if (code === "") continue;
        // daemon requires numeric exit code keys (AppBehavior)
        if (!/^-?\d+$/.test(code)) {
          ElMessage.error(`Exit code "${code}" must be an integer.`);
          return;
        }
        exitCodeActions[code] = rule.action;
      }
      this.registerForm.behavior = this.registerForm.behavior || {};
      this.registerForm.behavior.exit_code_actions = Object.keys(exitCodeActions).length > 0 ? exitCodeActions : null;
      if (this.registerForm.start_time_TEXT && this.registerForm.start_time_TEXT !== "") {
        // browser-zone datetime -> UTC seconds
        this.registerForm.start_time = localTimeToSeconds(this.registerForm.start_time_TEXT);
      }
      if (this.registerForm.end_time_TEXT && this.registerForm.end_time_TEXT !== "") {
        // browser-zone datetime -> UTC seconds
        this.registerForm.end_time = localTimeToSeconds(this.registerForm.end_time_TEXT);
      }
      if (this.registerForm.daily_limitation.daily_start_TEXT && this.registerForm.daily_limitation.daily_start_TEXT !== "") {
        // day time -> seconds within a day (daemon units); Date.parse would shift by the zone offset
        this.registerForm.daily_limitation.daily_start = dayTimeToSeconds(this.registerForm.daily_limitation.daily_start_TEXT);
      }
      if (this.registerForm.daily_limitation.daily_end_TEXT && this.registerForm.daily_limitation.daily_end_TEXT !== "") {
        this.registerForm.daily_limitation.daily_end = dayTimeToSeconds(this.registerForm.daily_limitation.daily_end_TEXT);
      }
      applications.registerApp(this);
    },

    merge(local, origin) {
      for (const key in local) {
        // never copy unsafe keys (prototype pollution via API rows)
        if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
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
/* Flex column: form area scrolls once, footer pinned below — no nested drawer/card scroll. */
.reg-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.register-card {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 14px 20px 4px;
}

.register-card .el-input,
.register-card .depends-select {
  width: 340px;
  margin-right: 10px;
}

/* A number stepper only ever holds a short count, so it does not need the
   full text-input width. */
.register-card .el-input-number {
  width: 130px;
  margin-right: 10px;
}

/* section headers — same blue accent bar as the detail pages */
.sec-title {
  margin: 0 0 14px;
  padding-left: 9px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  color: #303133;
  border-left: 3px solid #409eff;
}

.sec-title:not(:first-child) {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.hint {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

/* exit-code rule rows: code input + action select + remove button on one line */
.exit-code-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.secret-note {
  max-width: 480px;
}

/* fixed-width labels so "Group"/"Other" never clip */
.perm-row {
  display: flex;
  align-items: center;
  gap: 10px;
  /* The form content is a wrapping flex row, so two short rows sat side by side
     and the margin-top below never took effect. Claiming a full line stacks them. */
  flex: 0 0 100%;
}

.perm-row + .perm-row {
  margin-top: 2px;
}

.perm-label {
  flex: 0 0 auto;
  width: 48px;
  color: #606266;
}

/* Compact spacing: tighter rows and dividers than Element defaults. */
.register-card :deep(.el-form-item) {
  margin-bottom: 12px;
}

.register-card :deep(.el-divider--horizontal) {
  margin: 10px 0;
}

.dialog-footer {
  flex: 0 0 auto;
  border-top: 1px solid #ebeef5;
  background-color: #ffffff;
  text-align: right;
  padding: 14px 20px;
}
</style>
