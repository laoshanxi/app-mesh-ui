<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Users</h4>
    </el-row>
    <el-row>
      <el-button-group>
      <el-button @click="btnClick('new')" type="primary" icon="el-icon-plus" >New</el-button>
      <el-button @click="btnClick('delete')" type="danger" icon="el-icon-delete" :disabled="!isSelected">Delete</el-button>
      <el-button @click="locked()" type="warning" icon="el-icon-lock" :disabled="!isSelected || isLocked">Lock</el-button>
      <el-button @click="unlocked()" type="success" icon="el-icon-unlock" :disabled="!isSelected || !isLocked">Unlock</el-button>
      <el-button @click="btnClick('roles')" type="success" icon="iconfont icon-role" :disabled="!isSelected">Roles</el-button>
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
         highlight-current-row
         @current-change="currentRowChange"
       >

         <el-table-column label="Name" width="200">
           <template slot-scope="scope">
             {{ scope.row.name }}
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
  </div>
</template>

<script>
import {getConfig} from '@/api/config'
import {locked, unlocked} from '@/api/user'

export default {
  data() {
    return {
      tableKey:0,
      isSelected:false,
      isLocked:false,
      list: [],
      listLoading: false,

      currentRow: null,
    }
  },
  mounted(){
    this.refreshData();
  },
  methods: {
    refreshData(){
      this.list = [];
      getConfig().then((res)=>{
        if(res && res.data && res.data.JWT){
          for(let p in res.data.JWT){
            this.list.push({
              name: p,
              locked: res.data.JWT[p].locked,
              roles: res.data.JWT[p].roles,
            });
          }
        }
      }, (res)=>{

      });
    },
    btnClick(action){
      switch (action){
        case "new": {
          // this.registerFormVisible = true;
          this.$alert("Nothing here", "New");
          return;
        }
        case "delete": {
          this.$alert("Nothing here", "Delete");
          return;
        }
        case "roles": {
          this.$alert("Nothing here", "Roles");
          return;
        }
      }
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
</style>
