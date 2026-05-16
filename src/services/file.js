import { getClient } from '@/utils/appmeshClient'
import { ElMessage } from 'element-plus'

export default {
  download: function (vueComp) {
    getClient().download_file(vueComp.downloadForm.filepath, vueComp.downloadForm.filepath).then(() => {
      ElMessage.success('File [' + vueComp.downloadForm.filepath + '] download success.');
    }).catch(() => { });
  },
  downloadFile: async function (vueComp, fileName) {
    vueComp.loading = true;
    try {
      await getClient().download_file(fileName, fileName);
      ElMessage.success('File [' + fileName + '] download success.');
    } catch (err) {
      // error handled by client onError
    } finally {
      vueComp.loading = false;
    }
  },
}
