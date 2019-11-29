import {getLabels, updateLabels} from '@/api/labels'

export default {
  getLabels: function(vueComp){
    getLabels().then((res)=>{
      for(let p in res.data){
        vueComp.form.labels.push({
          key : p,
          value : res.data[p]
        });
      }
    }, (res)=>{
      vueComp.$message.error('Get labels failed. ' + res.data, 5000);
    });
  },
  saveLabels: function(vueComp){
    vueComp.$refs["form"].validate((valid) => {
      if (valid) {
        let labels = {};
    
        for(let i=0;i<vueComp.form.labels.length;i++){
          labels[vueComp.form.labels[i].key] = vueComp.form.labels[i].value;
        }
    
        updateLabels(labels).then((res)=>{
          vueComp.$message.success('Labels update successfully.', 5000);
          vueComp.refresh();
        }, (res)=>{
    
        });
    
      } else {
        return false;
      }
    });
  }
}
