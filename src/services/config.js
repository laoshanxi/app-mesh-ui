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
    getClient().getConfig()
      .then(res => {
        this.setConfig(vueComp, res);
      })
      .catch(() => { }) // onError already showed the toast
      .finally(() => {
        vueComp.loading = false;
      });
  },

  saveConfig(vueComp) {
    vueComp.$refs.form.validate(valid => {
      if (!valid) return false;

      vueComp.loading = true;
      getClient().setConfig(vueComp.form)
        .then(res => {
          vueComp.form = res;
          ElMessage.success('Configuration updated successfully.');
        })
        .catch(() => { }) // onError already showed the toast
        .finally(() => {
          vueComp.loading = false;
        });
    });
  },

  getPrometheus(vueComp) {
    vueComp.loading = true;
    getClient().getMetrics()
      .then(res => {
        vueComp.content = res;
      })
      .catch(() => { }) // onError already showed the toast
      .finally(() => {
        vueComp.loading = false;
      });
  }
}
