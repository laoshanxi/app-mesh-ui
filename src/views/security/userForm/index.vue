<template>
  <div>
    <!-- {{ form }} -->
    <el-card shadow="never" class="register-card">
      <el-form :model="userForm" ref="userFormDom" :rules="userRules" label-width="160px">
        <el-form-item label="Name" prop="name">
          <label v-if="propForm.name != null && propForm.name.length > 0">{{ propForm.name }}</label>
          <el-input v-if="propForm.name == null || propForm.name.length == 0" v-model="userForm.name"></el-input>
        </el-form-item>
        <el-form-item v-if="propForm.name == null || propForm.name.length == 0" label="Password" prop="key">
          <el-input v-model="userForm.key"></el-input>
        </el-form-item>
        <el-form-item label="Metadata" prop="metadata">
          <el-input v-model="userForm.metadata"></el-input>
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="userForm.email"></el-input>
        </el-form-item>
        <el-form-item label="ExecUser" prop="exec_user">
          <el-input v-model="userForm.exec_user"></el-input>
        </el-form-item>
        <el-form-item label="Group" prop="group">
          <el-select v-model="userForm.group" filterable allow-create placeholder="Please select the group">
            <el-option v-for="item in groups" :key="item" :label="item" :value="item">{{ item }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Is locked" prop="locked">
          <el-switch v-model="userForm.locked" active-text="Locked" :active-value="true" inactive-text="Active"
            :inactive-value="false"></el-switch>
        </el-form-item>
        <el-form-item label="2FA enabled" prop="mfa_enabled">
          <el-switch v-model="userForm.mfa_enabled" active-text="Enabled" :active-value="true" inactive-text="Disabled"
            :inactive-value="false"></el-switch>
        </el-form-item>
        <el-form-item label="Roles" prop="roles">
          <el-transfer filterable filter-placeholder="Filter" :titles="['All roles', 'User roles']"
            v-model="userForm.roles" :data="roles"></el-transfer>
        </el-form-item>
      </el-form>
    </el-card>
    <div class="dialog-footer">
      <el-button @click="cancel()">Cancel</el-button>
      <el-button @click="reset()">Reset</el-button>
      <el-button type="primary" @click="saveRole()">Save</el-button>
    </div>
  </div>
</template>

<script>
import { getRoles } from "@/api/roles";
import { saveUser, getGroups } from "@/api/user";

export default {
  name: "UserForm",
  data() {
    return {
      userForm: {
        name: "",
        key: "",
        group: "",
        exec_user: "",
        metadata: "",
        email: "",
        locked: false,
        roles: [],
      },
      roles: [],
      groups: [],
      userRules: {
        name: [
          { required: true, message: "Name is not empty", trigger: "blur" },
        ],
        key: [
          { required: true, message: "Password is not empty", trigger: "blur" },
        ],
      },
    };
  },
  props: ["propForm"],
  created() {
    this.resetForm();
    this.setFromWithProps();
    this.initRoles();
  },
  updated() {
    this.initGroup();
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
  methods: {
    initGroup() {
      getGroups()
        .then((res) => {
          if (res.data) {
            this.groups = res.data;
          }
        })
        .then(() => { });
    },
    initRoles() {
      getRoles()
        .then((res) => {
          if (res.data) {
            for (let p in res.data) {
              this.roles.push({
                label: p,
                key: p,
                pinyin: p,
              });
            }
          }
        })
        .then((res) => { });
    },
    setFromWithProps() {
      if (Object.keys(this.propForm).length !== 0) {
        this.userForm = this.merge(this.propForm, this.userForm);
      } else {
        this.resetForm();
      }
    },
    resetForm() {
      this.userForm = {
        name: "",
        key: "",
        group: "",
        exec_user: "",
        metadata: "",
        email: "",
        locked: false,
        mfa_enabled: false,
        roles: [],
      };
    },
    cancel() {
      this.$emit("close");
    },
    reset() {
      this.$refs.userFormDom.resetFields();
    },

    saveRole() {
      //applications.addRole(this);
      saveUser(this.userForm)
        .then((res) => {
          if (this.propForm.name == null) {
            this.$message.success(
              "User " + this.userForm.name + " add successfully.",
              5000
            );
          } else {
            this.$message.success(
              "User " + this.userForm.name + " update successfully.",
              5000
            );
          }
          this.$emit("success");
          this.cancel();
        })
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

.register-card .el-input,
.register-card .el-select {
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
