import { getApplications, getApplicationByName, getAppLog, runApp, enableApp, disableApp, deleteApplication, registerApplication } from '@/api/applications'

export default {
  getAppList : function(vueComp){
    vueComp.listLoading = true;
    getApplications().then(response => {
      vueComp.list = response.data;
      vueComp.listLoading = false;
    }, res => {
      vueComp.listLoading = false;
    })
  },

  getAppByName: function(vueComp, name){
    vueComp.isLoadingDetail = true
    getApplicationByName(name).then(response => {
      vueComp.application = response.data;
      vueComp.isLoadingDetail = false
    }, res => {
      vueComp.isLoadingDetail = false;
    })
  },
  getAppLogByName: function(vueComp, name, pageNo){
    vueComp.isLoadingLog = true
    getAppLog(name, pageNo).then(response => {
      vueComp.appLogInfo = response.data;
      vueComp.isLoadingLog = false
    }, res => {
      vueComp.isLoadingLog = false;
    })
  },
  getAppLogForLogPage: function(vueComp, name, pageNo){
    vueComp.$emit("startLoading");
    vueComp.isLoadingLog = true
    getAppLog(name, pageNo).then(response => {
      vueComp.$emit("loadingDone", response.data);
    }, res => {
      vueComp.$emit("loadingDone", null);
    })
  },

  enableApp : function(vueComp){
    vueComp.$confirm(`Do you want to enable the application <${vueComp.currentRow.name}>?`, 'Tooltip', {
              confirmButtonText: 'Confirm',
              cancelButtonText: 'Cancel',
              type: 'warning'
            }).then(() => {
              enableApp(vueComp.currentRow.name).then((res)=>{
                vueComp.$message.success('Application '+vueComp.currentRow.name+' enabled successfully.', 5000);
                vueComp.fetchData();
              },(res)=>{
                console.info(res);
              });
            });
  },
  disableApp: function(vueComp){
    vueComp.$confirm(`Do you want to disable the application <${vueComp.currentRow.name}>?`, 'Tooltip', {
              confirmButtonText: 'Confirm',
              cancelButtonText: 'Cancel',
              type: 'warning'
            }).then(() => {
              disableApp(vueComp.currentRow.name).then((res)=>{
                vueComp.$message.success('Application '+vueComp.currentRow.name+' disabled successfully.', 5000);
                vueComp.fetchData();
              },(res)=>{
                console.info(res);
              });
            });
  },
  removeApp: function(vueComp){
    vueComp.$confirm(`Do you want to remove the application <${vueComp.currentRow.name}>?`, 'Tooltip', {
              confirmButtonText: 'Confirm',
              cancelButtonText: 'Cancel',
              type: 'warning'
            }).then(() => {
              deleteApplication(vueComp.currentRow.name).then((res)=>{
                vueComp.$message({
                  type: 'success',
                  message: `Application <${vueComp.currentRow.name}> removed successfully.`
                }, 5000);
                vueComp.fetchData();
              },(res)=>{
                console.info(res);
              });
            });
  },

  registerApp: function(vueComp){
    function removeEmptyProperties(obj){
      let hasValue = false;
      for(let p in obj){
        let isNull = false;
        if(Object.prototype.toString.call(obj[p])=='[object Object]'){
          isNull = !removeEmptyProperties(obj[p]);
        }
        if(obj[p]==null || obj[p].length==0 || isNull){
          delete obj[p];
        }else{
          hasValue = true;
        }
      }
      return hasValue;
    }
    function formatData(data){
      if(data.cache_lines) data.cache_lines = parseInt(data.cache_lines);
      if(data.permission) data.permission = parseInt(data.permission);
      if(data.pid) data.pid = parseInt(data.pid);
      // if(data.start_interval_seconds) data.start_interval_seconds = parseInt(data.start_interval_seconds);
      // if(data.start_interval_timeout) data.start_interval_timeout = parseInt(data.start_interval_timeout);
      if(data.resource_limit){
        if(data.resource_limit.cpu_shares) data.resource_limit.cpu_shares = parseInt(data.resource_limit.cpu_shares);
        if(data.resource_limit.memory_mb) data.resource_limit.memory_mb = parseInt(data.resource_limit.memory_mb);
        if(data.resource_limit.memory_virt_mb) data.resource_limit.memory_virt_mb = parseInt(data.resource_limit.memory_virt_mb);
      }
    }
    vueComp.$refs["regForm"].validate((valid) => {
      if (valid) {
        let data = JSON.parse(JSON.stringify(vueComp.registerForm));
        let envs = {
        };
        for(let i=0;i<vueComp.registerForm.envs.length;i++){
          envs[vueComp.registerForm.envs[i].name] = vueComp.registerForm.envs[i].value;
        }

        data.env = data.envs.length>0 ? envs : null;
        if(vueComp.daily_time_range!=null){
          data.daily_limitation.daily_start = vueComp.daily_time_range[0];
          data.daily_limitation.daily_end = vueComp.daily_time_range[1];
        }

        if(data.APP_DOCKER_OPTS && data.APP_DOCKER_OPTS.length > 0){
          data.env = !data.env ? {} : data.env;
          data.env["APP_DOCKER_OPTS"] = data.APP_DOCKER_OPTS;
          delete data.APP_DOCKER_OPTS;
        }
        if(data.APP_DOCKER_IMG_PULL_TIMEOUT && data.APP_DOCKER_IMG_PULL_TIMEOUT.length > 0){
          data.env = !data.env ? {} : data.env;
          data.env["APP_DOCKER_IMG_PULL_TIMEOUT"] = data.APP_DOCKER_IMG_PULL_TIMEOUT;
          delete data.APP_DOCKER_IMG_PULL_TIMEOUT;
        }

        removeEmptyProperties(data);
        formatData(data);

        registerApplication(data.name, data).then((res)=>{
          vueComp.$message.success('Application '+data.name+' register successfully.', 5000);
          vueComp.$emit("success");
          vueComp.reset();
        }, (res)=>{

        });

      } else {
        return false;
      }
    });
  },
}
