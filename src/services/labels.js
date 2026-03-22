import { getClient } from '@/utils/appmeshClient'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  getLabels(vueComp) {
    getClient().list_labels()
      .then(res => {
        vueComp.labels = Object.entries(res).map(([key, value]) => ({ key, value }));
      })
      .catch(err => {
        ElMessage.error(`Get labels failed: ${err.data}`);
      })
      .finally(() => {
        vueComp.listLoading = false;
      });
  },

  updateLabel(vueComp, row) {
    if (!row?.key?.trim() || !row?.value?.trim()) {
      ElMessage.error('Label key and value cannot be empty');
      return;
    }

    vueComp.listLoading = true;
    return getClient().add_label(row.key.trim(), row.value.trim())
      .then(() => {
        ElMessage.success('Label updated successfully');
        vueComp.refresh();
      })
      .catch(err => {
        ElMessage.error(`Update label failed: ${err.data}`);
      })
      .finally(() => {
        vueComp.listLoading = false;
      });
  },

  deleteLabel(vueComp, row) {
    if (!row?.key) {
      ElMessage.error('Invalid label key');
      return;
    }

    return ElMessageBox.confirm(
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
        return getClient().delete_label(row.key);
      })
      .then(() => {
        ElMessage.success(`Label "${row.key}" removed successfully`);
        vueComp.refresh();
      })
      .catch(err => {
        if (err !== 'cancel') {
          ElMessage.error(`Delete label failed: ${err}`);
        }
      })
      .finally(() => {
        vueComp.listLoading = false;
      });
  }
}
