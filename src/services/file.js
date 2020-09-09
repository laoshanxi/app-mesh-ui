import { upload, download } from '@/api/files';
export default {
  download: function(vueComp){
    download(vueComp.downloadForm.filepath).then((res)=>{
      console.info(res);
      var aLink = document.createElement('a');
      var blob = new Blob([res.data]);
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错, 感谢 Barret Lee 的反馈
      aLink.download = vueComp.downloadForm.filepath;
      aLink.href = URL.createObjectURL(blob);
      aLink.dispatchEvent(evt);
      aLink.click();
    }, (res)=>{
      vueComp.$message.error('File '+ vueComp.downloadForm.filepath +' download failed. ' + res.data, 5000);
    });
  },
  downloadFile: function(vueComp, fileName){
    download(fileName).then((res)=>{
      var aLink = document.createElement('a');
      var blob = new Blob([res.data]);
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错, 感谢 Barret Lee 的反馈
      aLink.download = fileName;
      aLink.href = URL.createObjectURL(blob);
      aLink.dispatchEvent(evt);
      aLink.click();
    }, (res)=>{
      vueComp.$message.error('File '+ fileName +' download failed. ' + res.data, 5000);
    });
  },
}
