<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Applications</h4>
    </el-row>
    <el-row>
      <el-button-group>
      <el-button @click="btnClick('register')" type="primary" icon="el-icon-plus" >Register</el-button>
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

    <!-- Register application dialog -->
    <!-- <el-dialog title="Register Application" :visible.sync="registerFormVisible" fullscreen="false"> -->
    <el-drawer custom-class="right-drawer"
      title="Register Application"
      :visible.sync="registerFormVisible"
      size="60%">
      <el-card shadow="never" class="register-card">
      <el-form :model="registerForm" ref="regForm" :rules="regRules" label-width="160px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="registerForm.name"></el-input>
        </el-form-item>
        <el-form-item label="Command line" prop="command">
          <el-input v-model="registerForm.command"></el-input>
        </el-form-item>
        <el-form-item label="Working dir" prop="working_dir">
          <el-input v-model="registerForm.working_dir"></el-input>
        </el-form-item>
		<el-form-item label="Comments" prop="comments">
          <el-input v-model="registerForm.comments"></el-input>
        </el-form-item>
        <el-divider></el-divider>
        <el-form-item label="Start user" prop="user">
          <el-input v-model="registerForm.user"></el-input>
        </el-form-item>
        <el-form-item label="Status">
          <el-switch
            v-model="registerForm.status"
            active-text="Enabled"
            :active-value="1"
            inactive-text="Disabled"
            :inactive-value="0">
          </el-switch>
        </el-form-item>
        <el-form-item label="Daily limitation">
            <el-time-picker
                is-range
                v-model="daily_time_range"
                range-separator="-"
                value-format="HH:mm:ss"
                start-placeholder="Start time"
                end-placeholder="End time">
            </el-time-picker>
        </el-form-item>

        <el-form-item label="CPU shares" prop="resource_limit.cpu_shares">
          <el-input type="number" v-model="registerForm.resource_limit.cpu_shares"></el-input>
        </el-form-item>
        <el-form-item label="Physical memory" prop="resource_limit.memory_mb">
          <el-input type="number" v-model="registerForm.resource_limit.memory_mb"></el-input> MB
        </el-form-item>
        <el-form-item label="Virtual memory" prop="resource_limit.memory_virt_mb">
          <el-input type="number" v-model="registerForm.resource_limit.memory_virt_mb"></el-input> MB
        </el-form-item>
        <el-divider></el-divider>
        <el-form-item
            v-for="(env, index) in registerForm.envs"
            :label="'Env ' + index"
            :key="env.key"
            :prop="'envs.' + index + '.value'"
            :rules="{
              required: true, message: 'ENV is not empty', trigger: 'blur'
            }"
          >
          <el-input v-model="env.name" ref="envs" style="width:200px"></el-input>=
          <el-input v-model="env.value" style="width:200px"></el-input><el-button @click.prevent="removeEnvReg(env)" icon="el-icon-delete"></el-button>
        </el-form-item>

        <el-form-item label="Posix timezone" prop="posix_timezone">
          <el-input v-model="registerForm.posix_timezone"></el-input>
        </el-form-item>
        <el-form-item label="Output cache lines" prop="cache_lines">
          <el-input type="number" v-model="registerForm.cache_lines"></el-input>
        </el-form-item>
        <el-form-item label="Docker image" prop="docker_image">
          <el-input v-model="registerForm.docker_image"></el-input>
        </el-form-item>
        <el-form-item label="Pid(for attach)" prop="pid">
          <el-input type="number" v-model="registerForm.pid"></el-input>
        </el-form-item>

        <el-divider></el-divider>
        <el-form-item label="Start time" prop="start_time"
          >
          <el-date-picker
                v-model="registerForm.start_time" value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="">
          </el-date-picker>
        </el-form-item>
		<el-form-item label="Start interval" prop="start_interval_seconds"
          >
          <el-input type="number" v-model="registerForm.start_interval_seconds"></el-input> S
        </el-form-item>
        <el-form-item label="Start interval timeout" prop="start_interval_timeout"
          >
          <el-input type="number" v-model="registerForm.start_interval_timeout" ></el-input> S
        </el-form-item>
        <el-form-item label="Keep running" prop="keep_running">
          <el-switch
            v-model="registerForm.keep_running"
            :active-value="true"
            :inactive-value="false">
          </el-switch>
        </el-form-item>
      </el-form>

      </el-card>
      <div class="dialog-footer">
        <el-button @click="registerFormVisible = false">Cancel</el-button>
        <el-button @click="reset()">Reset</el-button>
        <el-button @click="addEnvReg()">Add Env</el-button>
        <el-button type="primary" @click="registerApp()">Register</el-button>
      </div>
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

export default {
  components:{
    AppDetail,AppLog
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
      daily_time_range:null,
      initRegisterForm:null,
      registerForm:{
        name:'',
        command:'',
        working_dir:'',

        user:'',
        comments:'',
        status:1,//0 disabled, 1 enabled
        daily_limitation:{
          daily_start:'',
          daily_end:''
        },
        resource_limit:{
          cpu_shares:null,
          memory_mb:null,
          memory_virt_mb:null
        },
        envs:[],
        posix_timezone:'',
        cache_lines:null,
        docker_image:'',
        pid:null,

        start_interval_seconds:null,
        start_time:'',
        start_interval_timeout:null,

        keep_running:false //0 no, 1 yes
      },
      regRules:{
        name: [
          { required: true, message: 'Name is not empty', trigger: 'blur' }
        ],
        command: [
          { required: true, message: 'Command is not empty', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    reset(){
      this.$refs.regForm.resetFields();
      this.registerForm.envs = [];
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
    addEnvReg(){
      this.registerForm.envs.push({
        name:'',
        value: '',
        key: Date.now()
      });
      setTimeout(()=>{
        this.$refs["envs"][this.registerForm.envs.length - 1].focus();
      }, 100)
    },
    removeEnvReg(item){
      var index = this.registerForm.envs.indexOf(item)
      if (index !== -1) {
        this.registerForm.envs.splice(index, 1);
      }
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
          return;
        }
        case "disable": {
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
          return;
        }
      }
    },
    registerApp(){
      function removeEmptyProperties(obj){
        let hasValue = false;
        for(let p in obj){
          let isNull = false;
          if(Object.prototype.toString.call(obj[p])=='[object Object]'){
            isNull = !removeEmptyProperties(obj[p]);
          }
          if(obj[p]==null || obj[p].length==0 || isNull){
            delete obj[p];
          }else{
            hasValue = true;
          }
        }
        return hasValue;
      }
      function formatData(data){
        if(data.cache_lines) data.cache_lines = parseInt(data.cache_lines);
        if(data.pid) data.pid = parseInt(data.pid);
        if(data.start_interval_seconds) data.start_interval_seconds = parseInt(data.start_interval_seconds);
        if(data.start_interval_timeout) data.start_interval_timeout = parseInt(data.start_interval_timeout);
        if(data.resource_limit){
          if(data.resource_limit.cpu_shares) data.resource_limit.cpu_shares = parseInt(data.resource_limit.cpu_shares);
          if(data.resource_limit.memory_mb) data.resource_limit.memory_mb = parseInt(data.resource_limit.memory_mb);
          if(data.resource_limit.memory_virt_mb) data.resource_limit.memory_virt_mb = parseInt(data.resource_limit.memory_virt_mb);
        }
      }
      this.$refs["regForm"].validate((valid) => {
        if (valid) {
          let data = JSON.parse(JSON.stringify(this.registerForm));
          let envs = {
          };
          for(let i=0;i<this.registerForm.envs.length;i++){
            envs[this.registerForm.envs[i].name] = this.registerForm.envs[i].value;
          }

          data.env = data.envs.length>0 ? envs : null;
          if(this.daily_time_range!=null){
            data.daily_limitation.daily_start = this.daily_time_range[0];
            data.daily_limitation.daily_end = this.daily_time_range[1];
          }

          removeEmptyProperties(data);
          formatData(data);

          registerApplication(data.name, data).then((res)=>{
            this.fetchData();
            Message({
              message: 'Application '+data.name+' register successfully.',
              type: 'success',
              duration: 5 * 1000
            });
            this.registerFormVisible = false;
            this.reset();
          }, (res)=>{

          });

        } else {
          return false;
        }
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
      let units = ["B", "KB", "MB", "GB", "TB", "PB"];
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
