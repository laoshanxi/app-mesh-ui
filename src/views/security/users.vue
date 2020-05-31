<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Users</h4>
    </el-row>
    <el-row>
      <el-button-group>
      <el-button @click="btnClick('new')" type="primary" icon="el-icon-plus" >New</el-button>
      <el-button @click="btnClick('update')" type="success" icon="iconfont icon-role" :disabled="!isSelected">Edit</el-button>
      <el-button @click="delUser()" type="danger" icon="el-icon-delete" :disabled="!isSelected">Delete</el-button>
      </el-button-group>
      <el-button-group>
      <el-button @click="locked()" type="warning" icon="el-icon-lock" :disabled="!isSelected || isLocked">Lock</el-button>
      <el-button @click="unlocked()" type="success" icon="el-icon-unlock" :disabled="!isSelected || !isLocked">Unlock</el-button>
      </el-button-group>
    </el-row>
    <el-row>
       <el-table
         :key="tableKey"
         v-loading="listLoading"
         :data="list"
         element-loading-text="Loading"
         border
         style="width: 100%"
         height="100%"
         class="fix-table"
         highlight-current-row
         @current-change="currentRowChange"
       >

         <el-table-column label="User" width="150">
           <template slot-scope="scope">
             {{ scope.row.name }}
           </template>
         </el-table-column>
		 
		 <el-table-column label="Group" width="150">
           <template slot-scope="scope">
             {{ scope.row.group }}
           </template>
         </el-table-column>
		 
         <el-table-column label="ExecUser" width="150">
           <template slot-scope="scope">
             {{ scope.row.exec_user }}
           </template>
         </el-table-column>
		 
		 <el-table-column label="Metadata">
           <template slot-scope="scope">
             {{ scope.row.metadata }}
           </template>
         </el-table-column>

         <el-table-column class-name="status-col" label="Status" width="110">
           <template slot-scope="scope">
             <el-tag v-if="scope.row.locked" :type="'danger'">
               Locked
             </el-tag>
             <el-tag v-else :type="'success'">
               Normal
             </el-tag>

           </template>
         </el-table-column>
         <el-table-column label="Roles">
           <template slot-scope="scope">
             <el-tag type="info" style="margin:0px 5px 5px 0px;" v-for="role in scope.row.roles">{{role}}</el-tag>
           </template>
         </el-table-column>
       </el-table>
    </el-row>
    <el-drawer
      custom-class="right-drawer"
      :title="selectedForm.name==null ? 'Add user' : 'Update user'"
      :visible.sync="userFormVisible"
      size="60%"
    >
      <user-form
        @close="userFormVisible = false"
        @success="addUserSuccess()"
        :propForm="selectedForm"
      ></user-form>
    </el-drawer>
  </div>
</template>

<script>
import {locked, unlocked, getUsers, addUser, delUser} from '@/api/user'
import UserForm from './userForm'

export default {
  components: {
    UserForm,
  },
  data() {
    return {
      tableKey:0,
      isSelected:false,
      isLocked:false,
      list: [],
      listLoading: false,

      currentRow: null,
      userFormVisible: false,
      selectedForm: {}
    }
  },
  mounted(){
    this.refreshData();
  },
  methods: {
    refreshData(){
      this.listLoading = true;
      this.list = [];
      getUsers().then((res)=>{
        if(res && res.data){
          for(let p in res.data){
            this.list.push({
              name: p,
			  group: res.data[p].group,
			  exec_user: res.data[p].exec_user,
              locked: res.data[p].locked,
              roles: res.data[p].roles,
              metadata: res.data[p].metadata,
            });
          }
        }
        this.listLoading = false;
      },(res)=>{
        this.listLoading = false;
      });
    },
    btnClick(action){
      switch (action){
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
            group: this.currentRow.group,
            exec_user: this.currentRow.exec_user,
            metadata: this.currentRow.metadata,
          };
          this.userFormVisible = true;
          return;
        }
      }
    },
    addUserSuccess(){
      this.refreshData();
    },
    delUser(){
      this.$confirm(`Do you want to delete the user <${this.currentRow.name}>?`, 'Tooltip', {
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                type: 'warning'
      }).then(() => {
        this.listLoading = true;
        delUser(this.currentRow.name).then((res)=>{
          this.$message.success('User '+ this.currentRow.name+' had deleted.', 5000);
          this.refreshData();
        }, (res)=>{
          this.listLoading = false;
        });
      });
    },
    locked(){
      this.$confirm(`Do you want to lock the user <${this.currentRow.name}>?`, 'Tooltip', {
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                type: 'warning'
      }).then(() => {
        this.listLoading = true;
        locked(this.currentRow.name).then((res)=>{
          this.$message.success('User '+ this.currentRow.name+' had locked.', 5000);
          this.refreshData();
          this.listLoading = false;
        }, (res)=>{
          this.listLoading = false;
        });
      });
    },
    unlocked(){
      this.$confirm(`Do you want to unlock the user <${this.currentRow.name}>?`, 'Tooltip', {
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                type: 'warning'
      }).then(() => {
        this.listLoading = true;
        unlocked(this.currentRow.name).then((res)=>{
          this.$message.success('User '+ this.currentRow.name+' had unlocked.', 5000);
          this.refreshData();
          this.listLoading = false;
        }, (res)=>{
          this.listLoading = false;
        });
      });
    },
    currentRowChange(currentRow, oldCurrentRow){
      this.currentRow = currentRow;
      if(!currentRow){
        this.isSelected = false;
        this.isLocked = false;
        return;
      }
      this.isSelected = true;
      if(currentRow.locked){
        this.isLocked = true;
      }else{
        this.isLocked = false;
      }
    },
  }
}
</script>

<style scoped>
  .el-table th.gutter{
    display: table-cell!important;
  }
  .el-row{
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
