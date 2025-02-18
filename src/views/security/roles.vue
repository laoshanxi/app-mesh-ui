<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Roles</h4>
    </el-row>
    <el-row>
      <el-button-group>
        <el-button type="primary" icon="el-icon-plus" @click="btnClick('new')">New</el-button>
        <el-button
          type="danger" icon="el-icon-delete" :disabled="!isSelected"
          @click="btnClick('delete')"
        >
          Delete
        </el-button>
        <el-button
          type="success" icon="el-icon-key" :disabled="!isSelected"
          @click="btnClick('permissions')"
        >
          Permissions
        </el-button>
      </el-button-group>
    </el-row>
    <el-row>
      <el-table
        :key="tableKey" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        style="width: 100%" height="100%" class="fix-table" highlight-current-row @current-change="currentRowChange"
      >
        <el-table-column label="Name" width="200">
          <template slot-scope="scope">{{ scope.row.name }}</template>
        </el-table-column>

        <el-table-column label="Permissions">
          <template slot-scope="scope">
            <el-tag
              v-for="permission in scope.row.permissions" :key="permission.id" type="info"
              style="margin:0px 5px 5px 0px;"
            >
              {{ permission }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-drawer
      custom-class="right-drawer" :title="selectedForm.name == null ? 'Add role' : 'Update role permissions'"
      :visible.sync="permissionsVisible" size="60%"
    >
      <permissions :prop-form="selectedForm" @close="permissionsVisible = false" @success="updatePermissionsSuccess()">
      </permissions>
    </el-drawer>
  </div>
</template>

<script>
import { getClient } from '@/utils/appmeshClient'
import permissions from "./permissions";

export default {
  components: {
    permissions,
  },
  data() {
    return {
      tableKey: 0,
      isSelected: false,
      list: null,
      listLoading: false,

      currentRow: null,
      permissionsVisible: false,
      selectedForm: {},
    };
  },
  mounted() {
    this.refreshData();
  },
  methods: {
    updatePermissionsSuccess() {
      this.refreshData();
    },
    refreshData() {
      this.listLoading = true;
      this.list = [];
      getClient().view_roles().then((res) => {
          if (res) {
            for (let p in res) {
              this.list.push({
                name: p,
                permissions: res[p],
              });
            }
          }
          this.listLoading = false;
        },
        (res) => {
          this.listLoading = false;
        }
      ).catch((err) => { console.warn(err); });
    },
    btnClick(action) {
      switch (action) {
        case "new": {
          // this.registerFormVisible = true;
          this.selectedForm = {};
          this.permissionsVisible = true;
          return;
        }
        case "delete": {
          this.delRole();
          return;
        }
        case "permissions": {
          // this.$alert("Nothing here", "Permissions");
          this.selectedForm = {
            name: this.currentRow.name,
            permissions: this.currentRow.permissions,
          };
          this.permissionsVisible = true;
          return;
        }
      }
    },
    delRole() {
      this.$confirm(
        `Do you want to delete the role <${this.currentRow.name}>?`,
        "Tooltip",
        {
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      ).then(() => {
        this.listLoading = true;
        getClient().delete_role(this.currentRow.name).then(
          (res) => {
            this.$message.success(
              "Role " + this.currentRow.name + " had deleted.",
              5000
            );
            this.refreshData();
          },
          (res) => {
            this.listLoading = false;
          }
        );
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Delete canceled'
        });
      });
    },
    currentRowChange(currentRow, oldCurrentRow) {
      this.currentRow = currentRow;
      if (!currentRow) {
        this.isSelected = false;
        return;
      }
      this.isSelected = true;
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
</style>
