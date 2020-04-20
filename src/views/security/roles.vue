<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Roles</h4>
    </el-row>
    <el-row>
      <el-button-group>
      <el-button @click="btnClick('new')" type="primary" icon="el-icon-plus" >New</el-button>
      <el-button @click="btnClick('delete')" type="danger" icon="el-icon-delete" :disabled="!isSelected">Delete</el-button>
      <el-button @click="btnClick('permissions')" type="success" icon="el-icon-key" :disabled="!isSelected">Permissions</el-button>
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

         <el-table-column label="Name" width="200">
           <template slot-scope="scope">
             {{ scope.row.name }}
           </template>
         </el-table-column>

         <el-table-column label="Permissions">
           <template slot-scope="scope">
             <el-tag type="info" style="margin:0px 5px 5px 0px;" v-for="permission in scope.row.permissions">{{permission}}</el-tag>
           </template>
         </el-table-column>
       </el-table>
    </el-row>
    <el-drawer
      custom-class="right-drawer"
      :title="selectedForm.name==null ? 'Add role' : 'Update role permissions'"
      :visible.sync="permissionsVisible"
      size="60%"
    >
      <permissions
        @close="permissionsVisible = false"
        @success="updatePermissionsSuccess()"
        :propForm="selectedForm"
      ></permissions>
    </el-drawer>
  </div>
</template>

<script>
import {getConfig} from '@/api/config'
import {getRoles, delRole} from '@/api/roles'
import permissions from './permissions'

export default {
  components: {
    permissions,
  },
  data() {
    return {
      tableKey:0,
      isSelected:false,
      list: null,
      listLoading: false,

      currentRow: null,
      permissionsVisible: false,
      selectedForm: {}
    }
  },
  mounted(){
    this.refreshData();
  },
  methods: {
    updatePermissionsSuccess(){
      this.refreshData();
    },
    refreshData(){
      this.listLoading = true;
      this.list = [];
      getRoles().then((res)=>{
        if(res && res.data && res.data){
          for(let p in res.data){
            this.list.push({
              name: p,
              permissions: res.data[p],
            });
          }
        }
        this.listLoading = false;
      }, (res)=>{
        this.listLoading = false;
      });
    },
    btnClick(action){

      switch (action){
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
            permissions: this.currentRow.permissions
          };
          this.permissionsVisible = true;
          return;
        }
      }
    },
    delRole(){
      this.$confirm(`Do you want to delete the role <${this.currentRow.name}>?`, 'Tooltip', {
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                type: 'warning'
      }).then(() => {
        this.listLoading = true;
        delRole(this.currentRow.name).then((res)=>{
          this.$message.success('Role '+ this.currentRow.name+' had deleted.', 5000);
          this.refreshData();
        }, (res)=>{
          this.listLoading = false;
        });
      });
    },
    currentRowChange(currentRow, oldCurrentRow){
      this.currentRow = currentRow;
      if(!currentRow){
        this.isSelected = false;
        return;
      }
      this.isSelected = true;
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
</style>
