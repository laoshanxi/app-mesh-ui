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
      <el-button @click="btnClick('run')" type="success" icon="el-icon-caret-right" :disabled="!isSelected">Run</el-button>
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

         <el-table-column label="PID" width="100">
           <template slot-scope="scope">
             {{ formatEmpty(scope.row.pid) }}
           </template>
         </el-table-column>
         <el-table-column label="Name" width="150">
           <template slot-scope="scope">
             <span>{{ scope.row.name }}</span>
           </template>
         </el-table-column>
         <el-table-column label="Command" width="150">
           <template slot-scope="scope">
             {{ scope.row.command }}
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
         <el-table-column label="Return" width="110">
           <template slot-scope="scope">
             {{ formatEmpty(scope.row.return) }}
           </template>
         </el-table-column>
         <el-table-column label="Memory" width="110">
           <template slot-scope="scope">
             {{ formatMemory(scope.row.memory) }}
           </template>
         </el-table-column>
         <el-table-column label="User" width="110">
           <template slot-scope="scope">
             {{ formatEmpty(scope.row.user) }}
           </template>
         </el-table-column>
         <el-table-column label="Working Dir">
           <template slot-scope="scope">
             {{ formatEmpty(scope.row.working_dir) }}
           </template>
         </el-table-column>
         <el-table-column prop="last_start_time" label="Last Start Time" width="200">
           <template slot-scope="scope">
             <i class="el-icon-time" />
             <span v-if="scope.row.last_start_time">{{ scope.row.last_start_time | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
             <span v-else>-</span>
           </template>
         </el-table-column>
       </el-table>
    </el-row>
    <!-- Run application dialog -->
    <el-dialog title="Run Application" :visible.sync="dialogFormVisible">
      <el-form :model="form" ref="dialogForm" :label-width="formLabelWidth">
        <el-form-item label="Name">
          {{currentRow ? currentRow.name : ''}}
        </el-form-item>
        <el-form-item label="Sync/Async">
          <el-switch
            v-model="form.sync"
            active-text="Sync"
            inactive-text="Async">
          </el-switch>
        </el-form-item>
        <el-form-item label="Timeout"
            :rules="{
              required: true, message: 'Timeout is not empty', trigger: 'blur'
            }">
          <el-input v-model="form.timeout">10</el-input>S
        </el-form-item>
        <el-form-item
            v-for="(env, index) in form.envs"
            :label="'Env ' + index"
            :key="env.key"
            :prop="'envs.' + index + '.value'"
            :rules="{
              required: true, message: 'ENV is not empty', trigger: 'blur'
            }"
          >
          <el-input v-model="env.name"></el-input>=
          <el-input v-model="env.value"></el-input><el-button @click.prevent="removeEnv(env)" icon="el-icon-delete"></el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button @click="addEnv()">Add Env</el-button>
        <el-button type="primary" @click="realRunApp()">Run</el-button>
      </div>
    </el-dialog>

    <!-- Register application dialog -->
    <el-dialog title="Register Application" :visible.sync="registerFormVisible">
      <el-card shadow="never" style="height:400px;overflow-y: auto;">
      <el-form :model="registerForm" ref="regForm" :rules="regRules" label-width="160px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="registerForm.name"></el-input>
        </el-form-item>
        <el-form-item label="Command" prop="command">
          <el-input v-model="registerForm.command"></el-input>
        </el-form-item>
        <el-form-item label="Working Dir" prop="working_dir">
          <el-input v-model="registerForm.working_dir"></el-input>
        </el-form-item>
        <el-divider></el-divider>
        <el-form-item label="User" prop="user">
          <el-input v-model="registerForm.user"></el-input>
        </el-form-item>
        <el-form-item label="Comments" prop="comments">
          <el-input v-model="registerForm.comments"></el-input>
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
        <el-form-item label="Daily Limitation">
            <el-time-picker
                is-range
                v-model="daily_time_range"
                range-separator="-"
                value-format="HH:mm:ss"
                start-placeholder="Start Time"
                end-placeholder="End Time">
            </el-time-picker>
        </el-form-item>

        <el-form-item label="CPU Shares" prop="resource_limit.cpu_shares">
          <el-input v-model="registerForm.resource_limit.cpu_shares"></el-input>
        </el-form-item>
        <el-form-item label="Memory" prop="resource_limit.memory_mb">
          <el-input v-model="registerForm.resource_limit.memory_mb"></el-input> MB
        </el-form-item>
        <el-form-item label="Memory Virt" prop="resource_limit.memory_virt_mb">
          <el-input v-model="registerForm.resource_limit.memory_virt_mb"></el-input> MB
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
          <el-input v-model="env.name"></el-input>=
          <el-input v-model="env.value"></el-input><el-button @click.prevent="removeEnvReg(env)" icon="el-icon-delete"></el-button>
        </el-form-item>

        <el-form-item label="Posix Timezone" prop="posix_timezone">
          <el-input v-model="registerForm.posix_timezone"></el-input>
        </el-form-item>
        <el-form-item label="Cache Lines" prop="cache_lines">
          <el-input v-model="registerForm.cache_lines"></el-input>
        </el-form-item>
        <el-form-item label="Docker Image" prop="docker_image">
          <el-input v-model="registerForm.docker_image"></el-input>
        </el-form-item>
        <el-form-item label="PID" prop="pid">
          <el-input v-model="registerForm.pid"></el-input>
        </el-form-item>

        <el-divider></el-divider>
        <el-form-item label="Keep Running" prop="keep_running">
          <el-switch
            v-model="registerForm.keep_running"
            :active-value="1"
            :inactive-value="0">
          </el-switch>
        </el-form-item>
        <el-form-item label="Start Interval Seconds" prop="start_interval_seconds"
          >
          <el-input v-model="registerForm.start_interval_seconds" :disabled="registerForm.keep_running=='1'"></el-input> S
        </el-form-item>
        <el-form-item label="Start Time" prop="start_time"
          >
          <el-date-picker
                v-model="registerForm.start_time" value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime" :disabled="registerForm.keep_running=='1'"
                placeholder="">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Start Interval Timeout" prop="start_interval_timeout"
          >
          <el-input v-model="registerForm.start_interval_timeout" :disabled="registerForm.keep_running=='1'"></el-input> S
        </el-form-item>

      </el-form>

      </el-card>
      <div slot="footer" class="dialog-footer">
        <el-button @click="registerFormVisible = false">Cancel</el-button>
        <el-button @click="addEnvReg()">Add Env</el-button>
        <el-button type="primary" @click="registerApp()">Register</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
import { getApplications, runApp, enableApp, disableApp, deleteApplication, registerApplication } from '@/api/applications'
import { parseTime } from '@/utils'
import { MessageBox, Message } from 'element-ui'

export default {
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
      isSelected:false,
      isStart:false,
      isEnabled:false,
      tableKey:0,
      total:15,
      pageSize:15,
      currentPage:1,
      list: null,
      listLoading: true,

      currentRow: null,
      dialogFormVisible : false,
      formLabelWidth: "100px",
      form : {
        sync : true,
        timeout : 10,
        envs : []
      },
      registerFormVisible: false,
      daily_time_range:null,
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

        keep_running:1 //0 no, 1 yes
      },
      regRules:{
        name: [
          { required: true, message: 'Name is not empty', trigger: 'blur' }
        ],
        command: [
          { required: true, message: 'Command is not empty', trigger: 'blur' }
        ],
        working_dir: [
          { required: true, message: 'Working Dir is not empty', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    addEnv(){
      this.form.envs.push({
        name:'',
        value: '',
        key: Date.now()
      });
    },
    addEnvReg(){
      this.registerForm.envs.push({
        name:'',
        value: '',
        key: Date.now()
      });
    },
    removeEnv(item){
      var index = this.form.envs.indexOf(item)
      if (index !== -1) {
        this.form.envs.splice(index, 1);
      }
    },
    removeEnvReg(item){
      var index = this.registerForm.envs.indexOf(item)
      if (index !== -1) {
        this.registerForm.envs.splice(index, 1);
      }
    },
    btnClick(action){
      switch (action){
        case "register": {
          this.registerFormVisible = true;
          return;
        }
        case "run": {
          this.dialogFormVisible = true;
          return;
        }
        case "delete": {
          deleteApplication(this.currentRow.name).then((res)=>{
            Message({
              message: 'Application '+this.currentRow.name+' removed successfully.',
              type: 'success',
              duration: 5 * 1000
            });
            this.fetchData();
          },(res)=>{
            console.info(res);
          });
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
      this.$refs["regForm"].validate((valid) => {
        if (valid) {
          let data = JSON.parse(JSON.stringify(this.registerForm));
          let envs = {
            env : {}
          };
          for(let i=0;i<this.registerForm.envs.length;i++){
            envs.env[this.registerForm.envs[i].name] = this.registerForm.envs[i].value;
          }

          data.envs = data.envs.length>0 ? envs : null;
          if(this.daily_time_range!=null){
            data.daily_limitation.daily_start = this.daily_time_range[0];
            data.daily_limitation.daily_end = this.daily_time_range[1];
          }

          removeEmptyProperties(data);

          registerApplication(data.name, data).then((res)=>{
            this.fetchData();
            Message({
              message: 'Application '+data.name+' register successfully.',
              type: 'success',
              duration: 5 * 1000
            });
            this.registerFormVisible = false;
          }, (res)=>{

          });

        } else {
          return false;
        }
      });
    },
    realRunApp(){
      this.$refs["dialogForm"].validate((valid) => {
        if (valid) {
          let appname = this.currentRow.name;
          let envs = {
            env : {}
          };
          for(let i=0;i<this.form.envs.length;i++){
            envs.env[this.form.envs[i].name] = this.form.envs[i].value;
          }

          runApp(appname, this.form.timeout, this.form.sync, envs).then((res)=>{
            Message({
              message: 'Application '+appname+' running successfully.',
              type: 'success',
              duration: 5 * 1000
            })
          },(res)=>{
            console.info(res);
          });
        } else {
          console.log('error submit!!');
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
    }
  }
}
</script>
<style lang="scss">
  //解决table表头错位
  .el-table th.gutter{
    display: table-cell!important;
  }
</style>
<style lang="scss" scoped>
  .el-row{
    margin-bottom: 8px;
  }
  .el-input{
    width:200px;
    margin-right: 10px;
  }
</style>
