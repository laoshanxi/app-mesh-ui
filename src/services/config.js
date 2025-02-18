import { getClient } from '@/utils/appmeshClient'

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
    getClient().view_config()
      .then(res => {
        this.setConfig(vueComp, res);
      })
      .catch(err => {
        vueComp.$message.error(`Get configuration failed: ${err.data}`, 5000);
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
          vueComp.$message.success('Configuration updated successfully.', 5000);
        })
        .catch(err => {
          vueComp.$message.error(`Update failed: ${err.data}`, 5000);
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
        vueComp.$message.error(`Get metrics failed: ${err.data}`, 5000);
      })
      .finally(() => {
        vueComp.loading = false;
      });
  }
}
