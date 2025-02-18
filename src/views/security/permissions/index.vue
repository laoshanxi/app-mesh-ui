<template>
  <div>
    <!-- {{ form }} -->
    <el-card shadow="never" class="register-card">
      <el-form ref="permissionFormDom" :model="permissionForm" :rules="permissionRules" label-width="160px">
        <el-form-item label="Role">
          <label v-if="propForm.name != null && propForm.name.length > 0">{{ propForm.name }}</label>
          <el-input v-if="propForm.name == null || propForm.name.length == 0" v-model="permissionForm.name"></el-input>
        </el-form-item>
        <el-form-item label="Permissions" prop="permissions">
          <el-transfer
            v-model="permissionForm.permissions" class="permission-transfer" filterable
            filter-placeholder="Filter" :titles="['All permissions', 'Role permissions']"
            :data="permissions"
          ></el-transfer>
          <el-input v-model="newPermission" style="margin-top:10px;"></el-input>
          <el-button @click="addNewPermission">Add new permission</el-button>
          <br />
          <span style="color:#909399;">* Note: Multiple permissions separated by commas</span>
        </el-form-item>
      </el-form>
    </el-card>
    <div class="dialog-footer">
      <el-button @click="cancel()">Cancel</el-button>
      <el-button @click="reset()">Reset</el-button>
      <el-button type="primary" @click="savePermissions()">Save</el-button>
    </div>
  </div>
</template>

<script>
import { getClient } from '@/utils/appmeshClient'

export default {
  name: "RoleForm",
  props: ["propForm"],
  data() {
    return {
      permissionForm: {
        permissions: [],
      },
      permissions: [],
      permissionsMap: {},
      permissionRules: {},
      newPermission: "",
    };
  },
  watch: {
    propForm: {
      handler: function (val, old) {
        if (val === old) {
          return;
        }

        this.setFromWithProps();
      },
      immediate: false,
    },
  },
  created() {
    this.resetForm();
    this.setFromWithProps();
    this.initData();
  },
  mounted() { },
  methods: {
    initData() {
      getClient().view_permissions()
        .then((res) => {
          if (res) {
            let permission = null;
            for (let i = 0; i < res.length; i++) {
              permission = res[i]
              this.permissions.push({
                label: permission,
                key: permission,
                pinyin: permission,
              });
              this.permissionsMap[permission] = permission;
            }
          }
        })
        .catch((err) => { console.warn(err); })
        .then((res) => { });
    },
    addNewPermission() {
      let newPermissions = this.newPermission.split(",");
      for (let i = 0; i < newPermissions.length; i++) {
        let permission = newPermissions[i];
        if (this.permissionsMap[permission] == null) {
          this.permissions.splice(0, 0, {
            label: permission,
            key: permission,
            pinyin: permission,
          });
        }
      }

      this.newPermission = "";
    },
    setFromWithProps() {
      if (Object.keys(this.propForm).length !== 0) {
        this.permissionForm = this.merge(this.propForm, this.permissionForm);
      } else {
        this.resetForm();
      }
    },
    resetForm() {
      this.permissionForm = {
        permissions: [],
      };
    },
    cancel() {
      this.$emit("close");
    },
    reset() {
      this.$refs.permissionFormDom.resetFields();
    },

    savePermissions() {
      getClient().update_role(
        this.permissionForm.name,
        this.permissionForm.permissions
      ).then((res) => {
          if (this.propForm.name == null) {
            this.$message.success(
              "Role " + this.permissionForm.name + " add successfully.",
              5000
            );
          } else {
            this.$message.success(
              "Role " + this.permissionForm.name + " update successfully.",
              5000
            );
          }

          this.$emit("success");
          this.cancel();
        })
        .catch((err) => { console.warn(err); })
        .then((res) => { });
    },

    merge(local, origin) {
      for (var key in local) {
        origin[key] =
          origin[key] && origin[key].toString() === "[object Object]"
            ? this.merge(origin[key], local[key])
            : (origin[key] = local[key]);
      }
      return origin;
    },
  },
};
</script>

<style scoped>
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

.detail-card {
  height: calc(100vh - 77px) !important;
  overflow-y: auto;
}
</style>
<style>
.permission-transfer,
.el-transfer-panel {
  height: 400px;
}

.el-transfer-panel__body,
.el-transfer-panel__list.is-filterable {
  height: 296px;
}

.permission-transfer .el-transfer-panel {
  width: 222px;
}
</style>
