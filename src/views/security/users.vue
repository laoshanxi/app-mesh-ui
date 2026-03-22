<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Users</h4>
    </el-row>
    <el-row>
      <el-button-group>
        <el-button type="primary" :icon="Plus" @click="btnClick('new')">New</el-button>
        <el-button
          type="success" :disabled="!isSelected"
          @click="btnClick('update')"
        >
          <i class="iconfont icon-role" style="margin-right: 4px;" />Edit
        </el-button>
        <el-button type="danger" :icon="Delete" :disabled="!isSelected" @click="delUser()">Delete</el-button>
      </el-button-group>
      <el-button-group>
        <el-button
          type="warning" :icon="Lock" :disabled="!isSelected || isLocked"
          @click="locked()"
        >
          Lock
        </el-button>
        <el-button
          type="success" :icon="Unlock" :disabled="!isSelected || !isLocked"
          @click="unlocked()"
        >
          Unlock
        </el-button>
      </el-button-group>
    </el-row>
    <el-row>
      <el-table
        :key="tableKey" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        style="width: 100%" height="100%" class="fix-table" highlight-current-row @current-change="currentRowChange"
      >
        <el-table-column label="User" width="150">
          <template #default="scope">{{ scope.row.name }}</template>
        </el-table-column>

        <el-table-column class-name="status-col" label="Status" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.locked" :type="'danger'">Locked</el-tag>
            <el-tag v-else :type="'success'">Active</el-tag>
          </template>
        </el-table-column>

        <el-table-column class-name="status-col" label="MFA" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.mfa_enabled" :type="'danger'">Enabled</el-tag>
            <el-tag v-else :type="'success'">Disabled</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Group" width="150">
          <template #default="scope">{{ scope.row.group }}</template>
        </el-table-column>

        <el-table-column label="Exec user" width="150">
          <template #default="scope">{{ scope.row.exec_user }}</template>
        </el-table-column>

        <el-table-column label="Metadata">
          <template #default="scope">{{ scope.row.metadata }}</template>
        </el-table-column>

        <el-table-column label="Email">
          <template #default="scope">{{ scope.row.email }}</template>
        </el-table-column>

        <el-table-column label="Roles">
          <template #default="scope">
            <el-tag v-for="(role, index) in scope.row.roles" :key="index" type="info" style="margin:0px 5px 5px 0px;">
              {{ role }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-drawer
      v-model="userFormVisible"
      custom-class="right-drawer" size="60%"
    >
      <template #header><span>{{ selectedForm.name == null ? 'Add user' : 'Update user' }}</span></template>
      <user-form :prop-form="selectedForm" @close="userFormVisible = false" @success="addUserSuccess()"></user-form>
    </el-drawer>
  </div>
</template>

<script>
import { getClient } from "@/utils/appmeshClient";
import { ElMessageBox, ElMessage } from "element-plus";
import { markRaw } from 'vue'
import { Plus, Delete, Lock, Unlock } from "@element-plus/icons-vue";
import UserForm from "./userForm/index.vue";

export default {
  components: {
    UserForm,
  },
  data() {
    return {
      Plus: markRaw(Plus), Delete: markRaw(Delete), Lock: markRaw(Lock), Unlock: markRaw(Unlock),
      tableKey: 0,
      isSelected: false,
      isLocked: false,
      list: [],
      listLoading: false,

      currentRow: null,
      userFormVisible: false,
      selectedForm: {},
    };
  },
  mounted() {
    this.refreshData();
  },
  methods: {
    refreshData() {
      this.listLoading = true;
      this.list = [];
      getClient().list_users().then(
        (res) => {
          if (res) {
            for (let p in res) {
              this.list.push({
                name: p,
                group: res[p].group,
                exec_user: res[p].exec_user,
                locked: res[p].locked,
                mfa_enabled: res[p].mfa_enabled,
                roles: res[p].roles,
                metadata: res[p].metadata,
                email: res[p].email,
              });
            }
          }
          this.listLoading = false;
        },
        () => {
          this.listLoading = false;
        }
      ).catch((err) => {
        console.warn(err);
        this.listLoading = false;
      });
    },
    btnClick(action) {
      switch (action) {
        case "new": {
          this.selectedForm = {};
          this.userFormVisible = true;
          return;
        }
        case "delete": {
          this.delUser();
          return;
        }
        case "update": {
          this.selectedForm = {
            name: this.currentRow.name,
            roles: this.currentRow.roles,
            locked: this.currentRow.locked,
            mfa_enabled: this.currentRow.mfa_enabled,
            group: this.currentRow.group,
            exec_user: this.currentRow.exec_user,
            metadata: this.currentRow.metadata,
            email: this.currentRow.email,
          };
          this.userFormVisible = true;
          return;
        }
      }
    },
    addUserSuccess() {
      this.refreshData();
    },
    delUser() {
      ElMessageBox.confirm(
        `Do you want to delete the user <${this.currentRow.name}>?`,
        "Tooltip",
        {
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      ).then(() => {
        this.listLoading = true;
        getClient().delete_user(this.currentRow.name).then(
          () => {
            ElMessage.success("User " + this.currentRow.name + " had deleted.");
            this.refreshData();
          },
          () => {
            this.listLoading = false;
          }
        ).catch((err) => {
          console.warn(err);
          this.listLoading = false;
        });
      });
    },
    locked() {
      ElMessageBox.confirm(
        `Do you want to lock the user <${this.currentRow.name}>?`,
        "Tooltip",
        {
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      ).then(() => {
        this.listLoading = true;
        getClient().lock_user(this.currentRow.name).then(
          () => {
            ElMessage.success("User " + this.currentRow.name + " had locked.");
            this.refreshData();
            this.listLoading = false;
          },
          () => {
            this.listLoading = false;
          }
        ).catch((err) => {
          console.warn(err);
          this.listLoading = false;
        });
      });
    },
    unlocked() {
      ElMessageBox.confirm(
        `Do you want to unlock the user <${this.currentRow.name}>?`,
        "Tooltip",
        {
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      ).then(() => {
        this.listLoading = true;
        getClient().unlock_user(this.currentRow.name).then(
          () => {
            ElMessage.success("User " + this.currentRow.name + " had unlocked.");
            this.refreshData();
            this.listLoading = false;
          },
          () => {
            this.listLoading = false;
          }
        ).catch((err) => {
          console.warn(err);
          this.listLoading = false;
        });
      });
    },
    currentRowChange(currentRow, _oldCurrentRow) {
      this.currentRow = currentRow;
      if (!currentRow) {
        this.isSelected = false;
        this.isLocked = false;
        return;
      }
      this.isSelected = true;
      if (currentRow.locked) {
        this.isLocked = true;
      } else {
        this.isLocked = false;
      }
    },
  },
};
</script>

<style scoped>
.el-table th.gutter {
  display: table-cell !important;
}

.el-row {
  margin-bottom: 8px;
}

.register-card {
  height: calc(100vh - 136px) !important;
  overflow-y: auto;
}

.register-card .el-input {
  width: 350px;
  margin-right: 10px;
}

.right-drawer .dialog-footer {
  border-top: 1px solid #bfcbd9;
  background-color: #ffffff;
  width: 100%;
  position: absolute;
  bottom: 0px;
  text-align: right;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-right: 30px;
}
</style>
