import { getClient } from '@/utils/appmeshClient'
import { ElMessage } from 'element-plus'

export default {
  download: function (vueComp) {
    getClient().download_file(vueComp.downloadForm.filepath, vueComp.downloadForm.filepath).then(() => {
      ElMessage.success('File [' + vueComp.downloadForm.filepath + '] download success.');
    }).catch(() => { });
  },
  downloadFile: async function (vueComp, fileName) {
    try {
      vueComp.loading = true;
      getClient().download_file(fileName, fileName).then(() => {
        ElMessage.success('File [' + fileName + '] download success.');
      });
      vueComp.loading = false;
    } catch (err) { vueComp.loading = false; }
  },
}
