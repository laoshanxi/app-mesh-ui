import { getClient } from '@/utils/appmeshClient'
import { ElMessage, ElMessageBox } from 'element-plus'
import { parseDateFromUtcSeconds, formatEpochSeconds, formatDaySeconds } from '@/utils';
export default {
  // Populate the *_TEXT display fields that appDetail/appReg read. The daemon
  // emits epoch seconds (or day seconds for daily_limitation); it never sends *_TEXT.
  addDisplayFields: function (app) {
    if (!app) return;
    app.register_time_TEXT = formatEpochSeconds(app.register_time);
    app.start_time_TEXT = formatEpochSeconds(app.start_time);
    app.end_time_TEXT = formatEpochSeconds(app.end_time);
    app.next_start_time_TEXT = formatEpochSeconds(app.next_start_time);
    app.last_start_time_TEXT = formatEpochSeconds(app.last_start_time);
    app.last_exit_time_TEXT = formatEpochSeconds(app.last_exit_time);
    if (app.daily_limitation) {
      app.daily_limitation.daily_start_TEXT = formatDaySeconds(app.daily_limitation.daily_start);
      app.daily_limitation.daily_end_TEXT = formatDaySeconds(app.daily_limitation.daily_end);
    }
  },
  getAppList: function (vueComp) {
    const selectedName = vueComp.currentRow ? vueComp.currentRow.name : null;
    vueComp.listLoading = true;
    getClient().list_apps().then(data => {
      data.forEach(m => {
        m.desc = m.description
        this.addDisplayFields(m);
        m.age = this.humanReadableDuration(parseDateFromUtcSeconds(m.register_time), new Date())
        if (m.last_start_time && m.pid) {
          m.duration = this.humanReadableDuration(parseDateFromUtcSeconds(m.last_start_time), new Date())
        } else {
          m.duration = '-'
        }
      })
      vueComp.list = data;
      vueComp.listLoading = false;
      if (selectedName && vueComp.$refs.appTable) {
        const row = data.find(r => r.name === selectedName);
        if (row) {
          vueComp.$nextTick(() => {
            vueComp.$refs.appTable.setCurrentRow(row);
          });
        }
      }
    }, () => {
      vueComp.listLoading = false;
    })
  },
  humanReadableDuration(start, end) {
    const ms = end.getTime() - start.getTime();
    if (ms < 0) return 'N/A';

    const days = Math.floor(ms / (24 * 3600 * 1000));
    const hours = Math.floor((ms % (24 * 3600 * 1000)) / (3600 * 1000));
    const minutes = Math.floor((ms % (3600 * 1000)) / (60 * 1000));
    const seconds = Math.round((ms % (60 * 1000)) / 1000);

    if (days > 0) return hours > 0 ? `${days}d${hours}h` : `${days}d`;
    if (hours > 0) return minutes > 0 ? `${hours}h${minutes}m` : `${hours}h`;
    if (minutes > 0) return seconds > 0 ? `${minutes}m${seconds}s` : `${minutes}m`;
    return `${seconds}s`;
  },
  getAppByName: function (vueComp, name) {
    vueComp.isLoadingDetail = true
    getClient().get_app(name).then(data => {
      this.addDisplayFields(data);
      vueComp.application = data;
      vueComp.isLoadingDetail = false
    }, () => {
      vueComp.isLoadingDetail = false;
    })
  },
  getAppLogByName: function (vueComp, name, pageNo, position) {
    vueComp.isLoadingLog = true
    getClient().get_app_output(name, position, pageNo).then(data => {
      vueComp.appLogInfo = data.output;
      vueComp.isLoadingLog = false
    }, () => {
      vueComp.isLoadingLog = false;
    })
  },
  getAppLogForLogPage: function (vueComp, name, pageNo, position) {
    vueComp.$emit("startLoading");
    vueComp.isLoadingLog = true
    getClient().get_app_output(name, position, pageNo).then(data => {
      vueComp.$emit("loadingDone", data.output);
    }, () => {
      vueComp.$emit("loadingDone", null);
    })
  },

  enableApp: function (vueComp) {
    ElMessageBox.confirm(`Do you want to enable the application <${vueComp.currentRow.name}>?`, 'Tooltip', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }).then(() => {
      getClient().enable_app(vueComp.currentRow.name).then(() => {
        ElMessage.success('Application ' + vueComp.currentRow.name + ' enabled successfully.');
        vueComp.fetchData();
      }, () => {
      });
    });
  },
  disableApp: function (vueComp) {
    ElMessageBox.confirm(`Do you want to disable the application <${vueComp.currentRow.name}>?`, 'Tooltip', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }).then(() => {
      getClient().disable_app(vueComp.currentRow.name).then(() => {
        ElMessage.success('Application ' + vueComp.currentRow.name + ' disabled successfully.');
        vueComp.fetchData();
      }, () => {
      });
    });
  },
  removeApp: function (vueComp) {
    ElMessageBox.confirm(`Do you want to remove the application <${vueComp.currentRow.name}>?`, 'Tooltip', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }).then(() => {
      getClient().delete_app(vueComp.currentRow.name).then(() => {
        ElMessage.success(`Application <${vueComp.currentRow.name}> removed successfully.`);
        vueComp.fetchData();
      }, () => {
      });
    });
  },

  registerApp: function (vueComp) {
    function removeEmptyProperties(obj) {
      let hasValue = false;
      for (const p in obj) {
        let isNull = false;
        if (Object.prototype.toString.call(obj[p]) === '[object Object]') {
          isNull = !removeEmptyProperties(obj[p]);
        }
        if (obj[p] == null || obj[p].length === 0 || isNull) {
          delete obj[p];
        } else {
          hasValue = true;
        }
      }
      return hasValue;
    }
    function formatData(data) {
      if (data.stdout_backup_count) data.stdout_backup_count = parseInt(data.stdout_backup_count);
      if (data.permission) data.permission = parseInt(data.permission);
      if (data.pid) data.pid = parseInt(data.pid);
      if (data.resource_limit) {
        if (data.resource_limit.cpu_shares) data.resource_limit.cpu_shares = parseInt(data.resource_limit.cpu_shares);
        if (data.resource_limit.memory_mb) data.resource_limit.memory_mb = parseInt(data.resource_limit.memory_mb);
        if (data.resource_limit.memory_virt_mb) data.resource_limit.memory_virt_mb = parseInt(data.resource_limit.memory_virt_mb);
      }
    }
    vueComp.$refs["regForm"].validate((valid) => {
      if (valid) {
        let data = JSON.parse(JSON.stringify(vueComp.registerForm));
        let envs = {
        };
        for (let i = 0; i < vueComp.registerForm.envs.length; i++) {
          envs[vueComp.registerForm.envs[i].name] = vueComp.registerForm.envs[i].value;
        }

        data.env = data.envs.length > 0 ? envs : null;

        // secret_env: write-only, never returned by the daemon — send only what the user (re)entered
        let secretEnvs = {};
        for (let i = 0; i < (vueComp.registerForm.secretEnvs || []).length; i++) {
          const item = vueComp.registerForm.secretEnvs[i];
          if (item.name && item.value) secretEnvs[item.name] = item.value;
        }
        data.secret_env = Object.keys(secretEnvs).length > 0 ? secretEnvs : null;
        delete data.secretEnvs;
        delete data.exitCodeActions; // UI-only rows; behavior.exit_code_actions carries the payload

        if (data.APP_DOCKER_OPTS && data.APP_DOCKER_OPTS.length > 0) {
          data.env = !data.env ? {} : data.env;
          data.env["APP_DOCKER_OPTS"] = data.APP_DOCKER_OPTS;
          delete data.APP_DOCKER_OPTS;
        }
        if (data.APP_DOCKER_IMG_PULL_TIMEOUT && data.APP_DOCKER_IMG_PULL_TIMEOUT.length > 0) {
          data.env = !data.env ? {} : data.env;
          data.env["APP_DOCKER_IMG_PULL_TIMEOUT"] = data.APP_DOCKER_IMG_PULL_TIMEOUT;
          delete data.APP_DOCKER_IMG_PULL_TIMEOUT;
        }

        removeEmptyProperties(data);
        formatData(data);
        removeEmptyProperties(data);

        getClient().add_app(data.name, data).then(() => {
          ElMessage.success('Application ' + data.name + ' register successfully.');
          vueComp.$emit("success");
          vueComp.reset();
        }, () => {

        });

      } else {
        return false;
      }
    });
  },
}
