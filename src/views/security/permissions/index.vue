<template>
  <div>
    <!-- {{ form }} -->
    <el-card shadow="never" class="register-card">
      <el-form
        :model="permissionForm"
        ref="permissionFormDom"
        :rules="permissionRules"
        label-width="160px"
      >
        <el-form-item label="Role">
          {{propForm.name}}
        </el-form-item>
        <el-form-item label="Permissions" prop="permissions">
          <el-transfer
              filterable
              filter-placeholder="Filter"
              :titles="['All permissions', 'Role permissions']"
              v-model="permissionForm.permissions"
              :data="permissions">
          </el-transfer>
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
import {updateRolePermissions} from "@/api/roles";
import {getPermissions} from "@/api/security";

export default {
  name: "RoleForm",
  data() {
    return {
      permissionForm: {
        permissions:[]
      },
      permissions:[],
      permissionRules: {

      }
    };
  },
  props: ["propForm"],
  created() {
    this.resetForm();
    this.setFromWithProps();
    this.initData();
  },
  mounted() {},
  watch: {
    propForm: {
      handler: function(val, old) {
        if (val === old) {
          return;
        }

        this.setFromWithProps();
      },
      immediate: false
    }
  },
  methods: {
    initData(){
      getPermissions().then((res)=>{
        if(res.data){
          let permission = null;
          for(let i=0;i<res.data.length;i++){
            permission = res.data[i];
            this.permissions.push({
              label:permission,
              key:permission,
              pinyin:permission,
            });
          }
        }
      }).then((res)=>{

      });
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
        permissions:[]
      };
    },
    cancel() {
      this.$emit("close");
    },
    reset() {
      this.$refs.permissionFormDom.resetFields();
    },

    savePermissions() {
      updateRolePermissions(this.propForm.name, this.permissionForm.permissions).then((res)=>{
        this.$message.success('Role '+this.propForm.name+' update successfully.', 5000);
        this.$emit("success");
        this.cancel();
      }).then((res)=>{

      });
    },

    merge(local, origin) {
      for (var key in local) {
        origin[key] =
          origin[key] && origin[key].toString() === "[object Object]"
            ? this.merge(origin[key], local[key])
            : (origin[key] = local[key]);
      }
      return origin;
    }
  }
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
