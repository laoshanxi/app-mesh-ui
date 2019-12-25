import {getLabels, updateLabels, updateLabel, deleteLabel} from '@/api/labels'

export default {
  getLabels: function(vueComp){
    getLabels().then((res)=>{
      for(let p in res.data){
        vueComp.labels.push({
          key : p,
          value : res.data[p]
        });
      }
    }, (res)=>{
      vueComp.$message.error('Get labels failed. ' + res.data, 5000);
    });
  },
  updateLabel: function(vueComp, row){
    if(row.key.length == 0){
      vueComp.$message.error('Label key is not empty.', 5000);
      return;
    }
    if(row.value.length == 0){
      vueComp.$message.error('Label value is not empty.', 5000);
      return;
    }
    updateLabel(row.key, row.value).then((res)=>{
      vueComp.$message.success('Label update successfully.', 5000);
      vueComp.refresh();
    }, (res)=>{
    
    });
  },
  deleteLabel: function(vueComp, row){
    vueComp.$confirm(`Do you want to remove the label <${row.key}>?`, 'Tooltip', {
              confirmButtonText: 'Confirm',
              cancelButtonText: 'Cancel',
              type: 'warning'
            }).then(() => {
              deleteLabel(row.key).then((res)=>{
                vueComp.$message({
                  type: 'success',
                  message: `Label <${row.key}> removed successfully.`
                }, 5000);
                vueComp.refresh();
              },(res)=>{
                console.info(res);
              });
            });
  },
  saveLabels: function(vueComp){
    vueComp.$refs["form"].validate((valid) => {
      if (valid) {
        let labels = {};

        for(let i=0;i<vueComp.labels.length;i++){
          labels[vueComp.labels[i].key] = vueComp.labels[i].value;
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
