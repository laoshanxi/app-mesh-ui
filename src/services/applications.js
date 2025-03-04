import { getClient } from '@/utils/appmeshClient'
import moment from "moment";
import { parseDateFromUtcSeconds, formatDayTime } from '@/utils';
export default {
  getAppList: function (vueComp) {
    vueComp.listLoading = true;
    getClient().view_all_apps().then(data => {
      data.forEach(m => {
        // desc
        m.desc = m.description
        // age
        m.age = this.humanReadableDuration(parseDateFromUtcSeconds(m.register_time), new Date())
        // duration
        if (m.last_start_time && m.pid) {
          m.duration = this.humanReadableDuration(parseDateFromUtcSeconds(m.last_start_time), new Date())
        } else {
          m.duration = '-'
        }
      })
      vueComp.list = data;
      vueComp.listLoading = false;
    }, res => {
      vueComp.listLoading = false;
    })
  },
  humanReadableDuration(start, end) {
    var date3 = end.getTime() - start.getTime(); //时间差秒
    if (date3 < 0) {
      return 'N/A'
    }
    //计算出相差天数
    var days = Math.floor(date3 / (24 * 3600 * 1000))
    days = days || ''

    //计算出小时数
    var leave1 = date3 % (24 * 3600 * 1000)   //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000))

    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000)        //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000))

    //计算相差秒数
    var leave3 = leave2 % (60 * 1000)      //计算分钟数后剩余的毫秒数
    var seconds = Math.round(leave3 / 1000)
    if (days > 0) {
      if (hours > 0) {
        return days + "d" + hours + 'h'
      }
      return days + "d"
    }
    else if (hours > 0) {
      if (minutes > 0) {
        return hours + "h" + minutes + "m"
      }
      return hours + "h"
    }
    else if (minutes > 0) {
      if (seconds > 0) {
        return minutes + "m" + seconds + 's'
      }
      return minutes + "m"
    }
    else {
      return seconds + 's'
    }
  },
  dateFromISO8601: function (isoDateString) {
    // "2021-10-13T21:24:17+08"
    if (isoDateString) {
      return moment.parseZone(isoDateString).toDate()
    }
    return isoDateString;
  },
  getAppByName: function (vueComp, name) {
    vueComp.isLoadingDetail = true
    getClient().view_app(name).then(data => {
      vueComp.application = data;
      vueComp.isLoadingDetail = false
    }, res => {
      vueComp.isLoadingDetail = false;
    })
  },
  getAppLogByName: function (vueComp, name, pageNo, position) {
    vueComp.isLoadingLog = true
    getClient().get_app_output(name, position, pageNo).then(data => {
      vueComp.appLogInfo = data.output;
      vueComp.isLoadingLog = false
    }, res => {
      vueComp.isLoadingLog = false;
    })
  },
  getAppLogForLogPage: function (vueComp, name, pageNo, position) {
    vueComp.$emit("startLoading");
    vueComp.isLoadingLog = true
    getClient().get_app_output(name, position, pageNo).then(data => {
      vueComp.$emit("loadingDone", data.output);
    }, res => {
      vueComp.$emit("loadingDone", null);
    })
  },

  enableApp: function (vueComp) {
    vueComp.$confirm(`Do you want to enable the application <${vueComp.currentRow.name}>?`, 'Tooltip', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }).then(() => {
      getClient().enable_app(vueComp.currentRow.name).then((res) => {
        vueComp.$message.success('Application ' + vueComp.currentRow.name + ' enabled successfully.', 5000);
        vueComp.fetchData();
      }, (res) => {
        console.info(res);
      });
    });
  },
  disableApp: function (vueComp) {
    vueComp.$confirm(`Do you want to disable the application <${vueComp.currentRow.name}>?`, 'Tooltip', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }).then(() => {
      getClient().disable_app(vueComp.currentRow.name).then((res) => {
        vueComp.$message.success('Application ' + vueComp.currentRow.name + ' disabled successfully.', 5000);
        vueComp.fetchData();
      }, (res) => {
        console.info(res);
      });
    });
  },
  removeApp: function (vueComp) {
    vueComp.$confirm(`Do you want to remove the application <${vueComp.currentRow.name}>?`, 'Tooltip', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }).then(() => {
      getClient().delete_app(vueComp.currentRow.name).then((res) => {
        vueComp.$message({
          type: 'success',
          message: `Application <${vueComp.currentRow.name}> removed successfully.`
        }, 5000);
        vueComp.fetchData();
      }, (res) => {
        console.info(res);
      });
    });
  },

  registerApp: function (vueComp) {
    function removeEmptyProperties(obj) {
      let hasValue = false;
      for (let p in obj) {
        let isNull = false;
        if (Object.prototype.toString.call(obj[p]) == '[object Object]') {
          isNull = !removeEmptyProperties(obj[p]);
        }
        if (obj[p] == null || obj[p].length == 0 || isNull) {
          delete obj[p];
        } else {
          hasValue = true;
        }
      }
      return hasValue;
    }
    function formatData(data) {
      if (data.cache_lines) data.cache_lines = parseInt(data.cache_lines);
      if (data.permission) data.permission = parseInt(data.permission);
      if (data.pid) data.pid = parseInt(data.pid);
      // if(data.start_interval_seconds) data.start_interval_seconds = parseInt(data.start_interval_seconds);
      // if(data.start_interval_timeout) data.start_interval_timeout = parseInt(data.start_interval_timeout);
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

        getClient().add_app(data.name, data).then((res) => {
          vueComp.$message.success('Application ' + data.name + ' register successfully.', 5000);
          vueComp.$emit("success");
          vueComp.reset();
        }, (res) => {

        });

      } else {
        return false;
      }
    });
  },
}
