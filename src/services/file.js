import { getClient } from '@/utils/appmeshClient'

export default {
  download: function (vueComp) {
    getClient().download_file(vueComp.downloadForm.filepath, vueComp.downloadForm.filepath).then((res) => {
      vueComp.$message.success('File [' + vueComp.downloadForm.filepath + '] download success. ', 5000);
    }).catch(err => { });
  },
  downloadFile: async function (vueComp, fileName) {
    try {
      vueComp.loading = true;
      getClient().download_file(fileName, fileName).then((res) => {
        vueComp.$message.success('File [' + fileName + '] download success. ', 5000);
      });
      vueComp.loading = false;
    } catch (err) { vueComp.loading = false; }
  },
}
