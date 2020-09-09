<template>

  <el-card @keyup.native="clearScreenByKeyUp" @keydown.native="clearScreenByKeyDown">
    <el-row slot="header">
      <el-col :span="3" style="text-align: center;height: 38px; line-height: 38px;">
        <el-switch
            v-model="isSync"
            active-text="Sync"
            inactive-text="Async">
        </el-switch>
      </el-col>
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
      <el-col :span="9">
      </el-col>
    </el-row>
    <div class="shell-div" ref="shell_div" @click="moveFocus">
      <el-button-group class="buttonsArea">
        <i class="el-icon-delete" @click="clearScreen"></i>
      </el-button-group>
      <div class="shell-content">
        <div v-for="line in shellContents" class="shell-line">
          <pre v-if="line.type == 'file'" class="file" @click="download(line)">{{line.content}}</pre>
          <pre v-else :class="{'command':line.type=='command'}">{{line.content}}</pre>
        </div>
      </div>
      <div class="shell-command" >
        <el-button v-if="connected==0" @click.stop="connectHost()">Re-connect</el-button>

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
  import shellService from '@/services/shell'
  import fileService from '@/services/file'

  export default {
    name: 'Shell',
    data(){
      return {
        timeout:10,
        control:false,
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
        isSync:true,
        shellApp : {
          command:'',
          shell_mode: true,
          working_dir:'/tmp'
        },
        connected : 0 //0,not-connected；1，connecting；2，connected
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
    },
    mounted () {
      this.connectHost();
    },
    methods:{
      clearScreen(){
        this.shellContents = [];
      },
      clearScreenByKeyDown(e){
        if(e.key=='Control'){
          this.control = true;
        }else if(this.control && e.key=='c'){
          this.clearScreen();
        }
      },
      clearScreenByKeyUp(e){
        if(e.key=='Control'){
          this.control = false;
        }
      },
      moveFocus(){
        this.$refs["input"].focus();
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
        shellService.connectHost(this);
      },
      runShell(){
        this.commands.push(this.input);
        this.shellContents.push(
          {
            content: "# " +this.input,
            type: "command"
          }
        );
        this.inputDisabled = true;
        shellService.run(this);
      },
      download(obj){
        fileService.downloadFile(this, obj.dir.trim() + "/" + obj.fileName);
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
    line-height: 24px;
    width: 100%;
    height:50px;
    background-color:#001528;
    color: #BFCBD9;
  }
  .shell-content{
    padding: 10px 10px 0px 10px;
    line-height: 24px;
    width: 100%;
    background-color:#001528;
    color: #BFCBD9;
  }
  .shell-line > pre{
    margin: 0px;
  }

  .shell-line > .command{
    color: #67C23A;
  }
  .shell-line > .file{
    color: #67C23A;
    cursor: pointer;
  }

</style>
