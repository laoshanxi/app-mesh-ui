<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Applications</h4>
    </el-row>
    <el-row>
      <el-button-group>
      <el-button @click="btnClick('register')" type="primary" icon="el-icon-plus" >Add</el-button>
      <el-button @click="btnClick('delete')" type="danger" icon="el-icon-delete" :disabled="!isSelected">Delete</el-button>
      <el-button @click="btnClick('enable')" type="success" icon="el-icon-open" :disabled="!isSelected || isEnabled">Enable</el-button>
      <el-button @click="btnClick('disable')" type="warning" icon="el-icon-turn-off" :disabled="!isSelected || !isEnabled">Disable</el-button>
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
             <el-link :underline="true" @click="showDetail()" title="Show application detail"><i class="el-icon-view el-icon--right"></i> {{ scope.row.name }}</el-link>
           </template>
         </el-table-column>
         <el-table-column label="User" width="110">
           <template slot-scope="scope">
             {{ formatEmpty(scope.row.user) }}
           </template>
         </el-table-column>
         <el-table-column class-name="status-col" label="State" width="110">
           <template slot-scope="scope">
             <el-tag v-if="scope.row.status==1" :type="'success'">
               Enabled
             </el-tag>
             <el-tag v-else :type="'info'">
               Disabled
             </el-tag>

           </template>
         </el-table-column>
         <el-table-column label="PID" width="100">
           <template slot-scope="scope">
             {{ formatEmpty(scope.row.pid) }}
           </template>
         </el-table-column>
         <el-table-column label="Memory" width="110">
           <template slot-scope="scope">
             {{ formatMemory(scope.row.memory) }}
           </template>
         </el-table-column>
         <el-table-column label="Return" width="110">
           <template slot-scope="scope">
             {{ formatEmpty(scope.row.return) }}
           </template>
         </el-table-column>
         <el-table-column prop="last_start_time" label="Last Start Time" width="200">
           <template slot-scope="scope">
             <span v-if="scope.row.last_start_time">
              <el-link :underline="true" @click="showLog()" title="Show log">
                <i class="el-icon-document"></i>
                <i class="el-icon-time" style="margin-right: 5px;" />
                {{ scope.row.last_start_time | parseTime('{y}-{m}-{d} {h}:{i}') }}
              </el-link>
             </span>
             <span v-else>-</span>
           </template>
         </el-table-column>
         <el-table-column label="Command" width="150">
           <template slot-scope="scope">
             {{ scope.row.command }}
           </template>
         </el-table-column>
         <el-table-column label="Working Dir">
           <template slot-scope="scope">
             {{ formatEmpty(scope.row.working_dir) }}
           </template>
         </el-table-column>

       </el-table>
    </el-row>

    <!-- Add application dialog -->
    <!-- <el-dialog title="Add Application" :visible.sync="registerFormVisible" fullscreen="false"> -->
    <el-drawer custom-class="right-drawer"
      title="Add Application"
      :visible.sync="registerFormVisible"
      size="60%">
      <app-reg @close="registerFormVisible = false" @success="regSuccess()"></app-reg>
    </el-drawer>

    <el-drawer
      :visible.sync="isShowDetail"
      v-loading="isLoadingDetail"
      size="50%">
      <span slot="title">
        <span class="el-icon-view">&nbsp;&nbsp;{{currentRow? currentRow.name:'Please select one application'}}</span>
      </span>
      <div class="detail-card">
        <app-detail :record="currentRow"/>
      </div>
    </el-drawer>
    <el-drawer
      :visible.sync="isShowLog"
      v-loading="isLoadingLog"
      size="50%">
      <span slot="title">
        <span class="el-icon-document">&nbsp;&nbsp;{{currentRow? currentRow.name:'Please select one application'}}</span>
      </span>
      <div class="detail-card">
        <app-log :loginfo="appLogInfo"/>
      </div>
    </el-drawer>
  </div>

</template>

<script>
import { getApplications, getApplicationByName, getAppLog, runApp, enableApp, disableApp, deleteApplication, registerApplication } from '@/api/applications'
import { parseTime } from '@/utils'
import { MessageBox, Message } from 'element-ui'
import AppDetail from './appDetail'
import AppLog from './appLog'
import AppReg from './appReg'

export default {
  components:{
    AppDetail, AppLog, AppReg
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      isShowLog:false,
      isLoadingLog:false,
      appLogInfo:null,
      isLoadingDetail:false,
      isShowDetail:false,
      isSelected:false,
      isEnabled:false,
      tableKey:0,
      total:15,
      pageSize:15,
      currentPage:1,
      list: null,
      listLoading: true,
      application: null,
      currentRow: null,
      formLabelWidth: "100px",
      registerFormVisible: false,


    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    regSuccess(){
      this.registerFormVisible = false;
      this.fetchData();
    },
    showDetail(){
      this.isShowDetail = true;
    },
    showLog(){
      this.isShowLog = true;
      setTimeout(()=>{
        this.getAppLogByName(this.currentRow.name);
      }, 500);
    },

    removeApp(){
      this.$confirm(`Do you want to remove the application <${this.currentRow.name}>?`, 'Tooltip', {
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                type: 'warning'
              }).then(() => {
                deleteApplication(this.currentRow.name).then((res)=>{
                  this.$message({
                    type: 'success',
                    message: `Application <${this.currentRow.name}> removed successfully.`
                  }, 5000);
                  this.fetchData();
                },(res)=>{
                  console.info(res);
                });
              });
    },
    btnClick(action){
      switch (action){
        case "register": {
          this.registerFormVisible = true;
          return;
        }
        case "delete": {
          this.removeApp();
          return;
        }
        case "enable": {
          this.enableApp();
          return;
        }
        case "disable": {
          this.disableApp();
          return;
        }
      }
    },
    enableApp(){
      this.$confirm(`Do you want to enable the application <${this.currentRow.name}>?`, 'Tooltip', {
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                type: 'warning'
              }).then(() => {
                enableApp(this.currentRow.name).then((res)=>{
                  Message({
                    message: 'Application '+this.currentRow.name+' enabled successfully.',
                    type: 'success',
                    duration: 5 * 1000
                  });
                  this.fetchData();
                },(res)=>{
                  console.info(res);
                });
              });
    },
    disableApp(){
      this.$confirm(`Do you want to disable the application <${this.currentRow.name}>?`, 'Tooltip', {
                confirmButtonText: 'Confirm',
                cancelButtonText: 'Cancel',
                type: 'warning'
              }).then(() => {
                disableApp(this.currentRow.name).then((res)=>{
                  Message({
                    message: 'Application '+this.currentRow.name+' disabled successfully.',
                    type: 'success',
                    duration: 5 * 1000
                  });
                  this.fetchData();
                },(res)=>{
                  console.info(res);
                });
              });
    },

    currentRowChange(currentRow, oldCurrentRow){
      this.currentRow = currentRow;
      if(!currentRow){
        this.isSelected = false;
        this.isEnabled = false;
        this.isStart = false;
        return;
      }
      this.isSelected = true;
      if(currentRow.status == 1){
        this.isEnabled = true;
      }else{
        this.isEnabled = false;
      }
      if(currentRow.pid > 0){
        this.isStart = true;
      }else{
        this.isStart = false;
      }
    },
    formatEmpty(value){
      return value || value == 0 ? value : "-";
    },
    formatMemory(memory){
      if(!memory){
        return "-";
      }
      let units = ["B", "Ki", "Mi", "Gi", "Ti", "Pi"];
      let index = 0;
      let compute = function(num){
        index ++;
        let result = num > 1024 ? num / 1024 : num;
        return result > 1024 ? compute(result) : result;
      }
      return compute(memory).toFixed(2) + " " + units[index];
    },
    handleSizeChange(value){
      this.pageSize = value;
    },
    handleCurrentChange(){
      console.info(arguments);
    },
    fetchData() {
      this.listLoading = true
      getApplications().then(response => {
        this.list = response.data;
        this.listLoading = false
      }, res => {
        this.listLoading = false;
      })
    },
    getAppByName(name){
      this.isLoadingDetail = true
      getApplicationByName(name).then(response => {
        this.application = response.data;
        this.isLoadingDetail = false
      }, res => {
        this.isLoadingDetail = false;
      })
    },
    getAppLogByName(name){
      this.isLoadingLog = true
      getAppLog(name).then(response => {
        this.appLogInfo = response.data;
        this.isLoadingLog = false
      }, res => {
        this.isLoadingLog = false;
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-row{
    margin-bottom: 8px;
  }
  .el-input{
    width:200px;
    margin-right: 10px;
  }
  .register-card{
    height: calc(100vh - 136px) !important;
    overflow-y: auto;
  }
  .register-card .el-input{
    width:350px;
    margin-right: 10px;
  }
  .right-drawer .dialog-footer{
    border-top: 1px solid #BFCBD9;
    background-color: #FFFFFF;
    width:100%;
    position: absolute;
    bottom: 0px;
    text-align: right;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-right: 30px;
  }
  .detail-card{
    height: calc(100vh - 77px) !important;
    overflow-y: auto;
  }
</style>
