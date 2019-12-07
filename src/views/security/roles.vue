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
  </div>
</template>

<script>
import {getConfig} from '@/api/config'

export default {
  data() {
    return {
      tableKey:0,
      isSelected:false,
      list: null,
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
        if(res && res.data && res.data.Roles){
          for(let p in res.data.Roles){
            this.list.push({
              name: p,
              permissions: res.data.Roles[p],
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
        case "permissions": {
          this.$alert("Nothing here", "Permissions");
          return;
        }
      }
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
