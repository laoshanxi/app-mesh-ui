import { getClient } from '@/utils/appmeshClient'
import { ElMessage } from 'element-plus'

export default {
  setConfig(vueComp, data) {
    vueComp.configData = data;
    for (let prop in vueComp.form) {
      if (Object.prototype.hasOwnProperty.call(data, prop)) {
        vueComp.form[prop] = data[prop];
      }
    }
  },

  refresh(vueComp) {
    vueComp.loading = true;
    getClient().get_config()
      .then(res => {
        this.setConfig(vueComp, res);
      })
      .catch(err => {
        ElMessage.error(`Get configuration failed: ${err.data}`);
      })
      .finally(() => {
        vueComp.loading = false;
      });
  },

  saveConfig(vueComp) {
    vueComp.$refs.form.validate(valid => {
      if (!valid) return false;

      vueComp.loading = true;
      getClient().set_config(vueComp.form)
        .then(res => {
          vueComp.form = res;
          ElMessage.success('Configuration updated successfully.');
        })
        .catch(err => {
          ElMessage.error(`Update failed: ${err.data}`);
        })
        .finally(() => {
          vueComp.loading = false;
        });
    });
  },

  getPrometheus(vueComp) {
    vueComp.loading = true;
    getClient().metrics()
      .then(res => {
        vueComp.content = res;
      })
      .catch(err => {
        ElMessage.error(`Get metrics failed: ${err.data}`);
      })
      .finally(() => {
        vueComp.loading = false;
      });
  }
}
