<template>
  <div>
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
         <el-input type="number" v-model="registerForm.resource_limit.memory_mb"></el-input> Mi
       </el-form-item>
       <el-form-item label="Virtual memory" prop="resource_limit.memory_virt_mb">
         <el-input type="number" v-model="registerForm.resource_limit.memory_virt_mb"></el-input> Mi
       </el-form-item>
       <el-divider></el-divider>


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
     </el-form>

     </el-card>
     <div class="dialog-footer">
       <el-button @click="cancel()">Cancel</el-button>
       <el-button @click="reset()">Reset</el-button>
       <el-button @click="addEnvReg()">Add Env</el-button>
       <el-button type="primary" @click="registerApp()">Save</el-button>
     </div>
  </div>

</template>

<script>
import applications from '@/services/applications'

export default {
  name:"AppReg",
  data(){
    return {
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
    };
  },
  props:[
  ],
  mounted(){
  },
  methods:{
    cancel(){
      this.$emit("close");
    },
    reset(){
      this.$refs.regForm.resetFields();
      this.registerForm.envs = [];
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
    registerApp(){
      applications.registerApp(this);
    },
  }
}
</script>

<style scoped>
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
