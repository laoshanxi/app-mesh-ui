import { getClient } from '@/utils'

export default {
  getLabels(vueComp) {
    const client = getClient();
    client.view_tags()
      .then(res => {
        vueComp.labels = Object.entries(res).map(([key, value]) => ({ key, value }));
      })
      .catch(err => {
        vueComp.$message.error(`Get labels failed: ${err.data}`, 5000);
      })
      .finally(() => {
        vueComp.listLoading = false;
      });
  },

  updateLabel(vueComp, row) {
    if (!row?.key?.trim() || !row?.value?.trim()) {
      vueComp.$message.error('Label key and value cannot be empty', 5000);
      return;
    }

    vueComp.listLoading = true;
    const client = getClient();
    return client.add_tag(row.key.trim(), row.value.trim())
      .then(() => {
        vueComp.$message.success('Label updated successfully', 5000);
        vueComp.refresh();
      })
      .catch(err => {
        vueComp.$message.error(`Update label failed: ${err.data}`, 5000);
      })
      .finally(() => {
        vueComp.listLoading = false;
      });
  },

  deleteLabel(vueComp, row) {
    if (!row?.key) {
      vueComp.$message.error('Invalid label key', 5000);
      return;
    }

    return vueComp.$confirm(
      `Do you want to remove the label "${row.key}"?`,
      'Confirm',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )
      .then(() => {
        vueComp.listLoading = true;
        const client = getClient();
        return client.delete_tag(row.key);
      })
      .then(() => {
        vueComp.$message.success(`Label "${row.key}" removed successfully`, 5000);
        vueComp.refresh();
      })
      .catch(err => {
        if (err !== 'cancel') {
          vueComp.$message.error(`Delete label failed: ${err.data}`, 5000);
        }
        vueComp.listLoading = false;
      });
  }
}
