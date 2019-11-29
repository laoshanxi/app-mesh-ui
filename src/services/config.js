import {getConfig, updateConfig} from '@/api/config'
export default {
  setConfig: function(vueComp, data){
    vueComp.configData = data;
    for(let prop in vueComp.form){
      if(data.hasOwnProperty(prop)){
        vueComp.form[prop] = data[prop];
      }
    }
  },
  refresh: function(vueComp){
    vueComp.loading = true;
    getConfig().then((res)=>{
      this.setConfig(vueComp, res.data);
      vueComp.loading = false;
    }, (res)=>{
      vueComp.loading = false;
      vueComp.$message.error('Get configuration failed. ' + res.data, 5000);
    });
  },
  saveConfig: function(vueComp){
    vueComp.$refs["form"].validate((valid) => {
      vueComp.loading = true;
      if (valid) {
        updateConfig(vueComp.form).then((res)=>{
          vueComp.$message.success('Configuration update successfully.', 5000);
          vueComp.form = res.data;
          vueComp.loading = false;
        }, (res)=>{
          vueComp.loading = false;
        });
      } else {
        vueComp.loading = false;
        return false;
      }
    });
  }
}
