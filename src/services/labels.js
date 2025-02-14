import { getClient } from '@/utils'

export default {
  getLabels: function (vueComp) {
    const client = getClient();
    client.view_tags().then((res) => {
      for (let p in res) {
        vueComp.labels.push({
          key: p,
          value: res[p]
        });
      }
      vueComp.listLoading = false;
    }, (res) => {
      vueComp.listLoading = false;
      vueComp.$message.error('Get labels failed. ' + res.data, 5000);
    });
  },

  updateLabel: function (vueComp, row) {
    if (row.key.length == 0) {
      vueComp.$message.error('Label key is not empty.', 5000);
      return;
    }
    if (row.value.length == 0) {
      vueComp.$message.error('Label value is not empty.', 5000);
      return;
    }
    vueComp.listLoading = true;
    const client = getClient();
    client.add_tag(row.key, row.value).then((res) => {
      vueComp.$message.success('Label update successfully.', 5000);
      vueComp.refresh();
    }, (res) => {
      vueComp.listLoading = false;
    });
  },

  deleteLabel: function (vueComp, row) {
    vueComp.$confirm(`Do you want to remove the label <${row.key}>?`, 'Tooltip', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }).then(() => {
      vueComp.listLoading = true;
      const client = getClient();
      client.delete_tag(row.key).then((res) => {
        vueComp.$message({
          type: 'success',
          message: `Label <${row.key}> removed successfully.`
        }, 5000);
        vueComp.refresh();
      }, (res) => {
        console.info(res);
        vueComp.listLoading = false;
      });
    });
  }
}
