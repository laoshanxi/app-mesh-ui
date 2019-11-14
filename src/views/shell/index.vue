<template>

  <el-card>
    <el-row slot="header">
      <el-col :span="2" style="text-align: center;height: 38px; line-height: 38px;">Timeout</el-col>
      <el-col :span="10">
        <el-slider
              v-model="timeout"
              :min="5"
              :max="60"
              show-input
              :marks="marks">
        </el-slider>
      </el-col>
      <el-col :span="12"></el-col>
    </el-row>
    <div class="shell-div" ref="shell_div">
      <el-button-group class="buttonsArea">
        <i class="el-icon-delete" @click="clearScreen"></i>
      </el-button-group>
      <div class="shell-content">
        <div v-for="line in shellContents" class="shell-line"><pre>{{line.content}}</pre></div>
      </div>
      <div class="shell-command" >
        <el-button v-if="connected==0" @click="connectHost()">Re-connect</el-button>

        <el-input ref="input" :disabled="inputDisabled" v-if="connected==2" class="shell-input" v-model="input"
          @keyup.enter.native="runShell()"
          @keyup.up.native="upCommand"
          @keyup.down.native="downCommand"
          placeholder="Please enter a command">
          <template slot="prepend"><pre># </pre></template>
        </el-input>
      </div>
    </div>
  </el-card>
</template>

<script>
  import { registerShApp,deleteApplication,runApp,getOutput } from '@/api/applications'
  export default {
    name: 'Shell',
    data(){
      return {
        timeout:10,
        marks: {
                  10: '10s',
                  20: '20s',
                  30: '30s',
                  40: '40s',
                  50: '50s',
        },
        timer:null,
        shellContents : [],
        commands: [],
        index:-1,
        input : "",
        inputDisabled:false,
        shellApp : {
          name:"",
          command:"${COMMAND}",
          working_dir:"/tmp",
          status:0
        },
        connected : 0//0,未连接；1，连接中；2，已连接
      }
    },
    created(){
    },
    components: {

    },
    destroyed(){
      if(this.timer){
        clearInterval(this.timer);
        this.timer = null;
      }
      deleteApplication(this.shellApp.name).then((res)=>{
        console.info("Remove the application " + this.shellApp.name + " successfully.");
      }, (res)=>{
        console.info("Remove the application " + this.shellApp.name + " failed.");
      });
    },
    mounted () {
      this.connectHost();
    },
    methods:{
      clearScreen(){
        this.shellContents = [];
      },
      upCommand(){
        if(this.commands.length==0){
          return;
        }
        if(this.index==-1){
          this.index = this.commands.length-1;
        }else if(this.index>0){
          this.index--;
        }
        this.input = this.commands[this.index];
        return;
      },
      downCommand(){
        if(this.commands.length==0){
          return;
        }
        if(this.index>-1 && this.index<this.commands.length-1){
          this.index++;
        }
        this.input = this.commands[this.index];
        return;
      },
      connectHost(){
        this.connected = 1;
        this.shellContents.push({
            content: "# Connecting remote host..."
        });
        this.shellApp.name = "sh-" + new Date().getTime();
        registerShApp(this.shellApp.name, this.shellApp).then((res)=>{
          this.connected = 2;
          this.shellContents.push(
            {
              content: "# Connected remote host successfully."
            }
          );
          this.runFinished();
        }, (res)=>{
          this.connected = 0;
          this.shellContents.push(
            {
              content: "# Connected remote host failed."
            }
          );
        });
      },
      runShell(){
        this.commands.push(this.input);
        this.shellContents.push(
          {
            content: "# " +this.input
          }
        );
        this.inputDisabled = true;
        this.run();
      },
      runFinished(){
        this.index=-1;
        if(this.timer){
          clearInterval(this.timer);
          this.timer = null;
        }
        this.input = '';
        this.inputDisabled = false;
        let shell = this.$refs['shell_div'];
        this.$nextTick(() => {
          shell.scrollTop = shell.scrollHeight;
          this.$refs["input"].focus();
        });
      },
      run(){
        let envs = {
          env :{
            "COMMAND" : this.input
          }
        };
        let shell = this.$refs['shell_div'];
        this.$nextTick(() => {
          shell.scrollTop = shell.scrollHeight;
        });
        runApp(this.shellApp.name, this.timeout, false, envs).then((res)=>{
          this.timer = setInterval(()=>{
            this.getOutputValue(res.data);
          }, 1000);
        }, (res)=>{
          console.info(res);
          this.shellContents.push({
              content: "# Failed: " + res.message
          });
          this.runFinished();
        });
      },
      getOutputValue(pid){
        getOutput(this.shellApp.name, pid).then((res)=>{
          if(res.status == 201){
            this.runFinished();
          }
          if(res.data==""){
            return;
          }
          this.shellContents.push({
              content: res.data
          });
          let shell = this.$refs['shell_div'];
          this.$nextTick(() => {
            shell.scrollTop = shell.scrollHeight;
          });
        }, (res)=>{
          this.shellContents.push({
              content: "# Failed: " + res.message
          });
          this.runFinished();
        });
      }
    }
  }
</script>

<style>
  .shell-input, .shell-input > div, .shell-input > input{
    border: 0px !important;
    margin: 0px !important;
    padding: 0px !important;
    background-color: #001528 !important;
    color: #889AA4;
  }
</style>
<style scoped>
  .buttonsArea{
    position: absolute;
    right: 35px;
    padding: 10px;
  }
  .buttonsArea i{
    cursor: pointer;
  }
  .shell-div{
    overflow: auto;
    width: 100%;
    height:calc(100vh - 92px - 75px);
    background-color:#001528;
    color: #BFCBD9;
  }
  .shell-command{
    padding: 0px 10px 10px 10px;
    line-height: 30px;
    width: 100%;
    height:50px;
    background-color:#001528;
    color: #BFCBD9;
  }
  .shell-content{
    padding: 10px 10px 0px 10px;
    line-height: 30px;
    width: 100%;
    background-color:#001528;
    color: #BFCBD9;
  }
  .shell-line > pre{
    margin: 0px;
  }

</style>
