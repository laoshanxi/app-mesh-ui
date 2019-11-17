<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Users</h4>
    </el-row>
    <el-row>
      <el-button-group>
      <el-button @click="btnClick('new')" type="primary" icon="el-icon-plus" >New</el-button>
      <el-button @click="btnClick('delete')" type="danger" icon="el-icon-delete" :disabled="!isSelected">Delete</el-button>
      <el-button @click="btnClick('lock')" type="warning" icon="el-icon-lock" :disabled="!isSelected || isLocked">Lock</el-button>
      <el-button @click="btnClick('unlock')" type="success" icon="el-icon-unlock" :disabled="!isSelected || !isLocked">Unlock</el-button>
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
             <el-link :underline="true" @click="showDetail()"><i class="el-icon-view el-icon--right"></i> {{ scope.row.name }}</el-link>
           </template>
         </el-table-column>

         <el-table-column class-name="status-col" label="Status" width="110">
           <template slot-scope="scope">
             <el-tag v-if="scope.row.locked" :type="'success'">
               Locked
             </el-tag>
             <el-tag v-else :type="'info'">
               Unlocked
             </el-tag>

           </template>
         </el-table-column>
         <el-table-column label="Roles">
           <template slot-scope="scope">
             {{ formatEmpty(scope.row.roles) }}
           </template>
         </el-table-column>
       </el-table>
    </el-row>
  </div>
</template>

<script>
import {getResources} from '@/api/resources'

export default {
  data() {
    return {
      tableKey:0,
      isSelected:false,
      isLocked:false,
      list: null,
      listLoading: false,

      currentRow: null,
    }
  },
  mounted(){
    getResources().then((res)=>{
      this.resources = res.data;
    }, (res)=>{

    });
  },
  methods: {
    btnClick(action){
      switch (action){
        case "new": {
          // this.registerFormVisible = true;
          this.$alert("Nothing here", "New");
          return;
        }
        case "lock": {
          // this.dialogFormVisible = true;
          return;
        }
        case "unlock": {
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
    formatEmpty(value){
      return (value && value.length>0) || value == 0 ? value : "-";
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
