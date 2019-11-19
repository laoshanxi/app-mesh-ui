<template>
  <div class="app-container" style="clear:both;" v-loading="loading">
    <el-row >
      <el-col :span="24">
        <el-tabs type="border-card">
          <el-tab-pane style="minWidth:600px;">
            <span slot="label"><i class="el-icon-s-operation"></i> Configuration</span>
            <el-form ref="form" :model="form" label-width="200px">
              <el-form-item label="Description" prop="Description">
                <el-input type="textarea" v-model="form.Description"></el-input>
              </el-form-item>
              <el-form-item label="Http thread pool size" prop="HttpThreadPoolSize">
                <el-input-number v-model="form.HttpThreadPoolSize"></el-input-number>
              </el-form-item>
              <el-form-item label="JWT enabled" prop="JWTEnabled">
                <el-switch
                  v-model="form.JWTEnabled"
                  active-text="Yes"
                  :active-value="true"
                  inactive-text="No"
                  :inactive-value="false">
                </el-switch>
              </el-form-item>
              <el-form-item label="JWT redirect url" prop="JWTRedirectUrl">
                <el-input v-model="form.JWTRedirectUrl"></el-input>
              </el-form-item>
              <el-form-item label="Log level" prop="LogLevel">
                <el-select v-model="form.LogLevel" placeholder="Please select">
                    <el-option
                      v-for="item in options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Rest enabled" prop="RestEnabled">
                <el-switch
                  v-model="form.RestEnabled"
                  active-text="Yes"
                  :active-value="true"
                  inactive-text="No"
                  :inactive-value="false">
                </el-switch>
              </el-form-item>
              <el-form-item label="Rest listen address" prop="RestListenAddress">
                <el-input v-model="form.RestListenAddress"></el-input>
              </el-form-item>
              <el-form-item label="RestListen port" prop="RestListenPort">
                <el-input v-model="form.RestListenPort"></el-input>
              </el-form-item>
              <el-form-item label="SSL certificate file" prop="SSLCertificateFile">
                <el-input v-model="form.SSLCertificateFile"></el-input>
              </el-form-item>
              <el-form-item label="SSL certificate key file" prop="SSLCertificateKeyFile">
                <el-input v-model="form.SSLCertificateKeyFile"></el-input>
              </el-form-item>
              <el-form-item label="SSL enabled" prop="SSLEnabled">
                <el-switch
                  v-model="form.SSLEnabled"
                  active-text="Yes"
                  :active-value="true"
                  inactive-text="No"
                  :inactive-value="false">
                </el-switch>
              </el-form-item>
              <el-form-item label="Schedule interval seconds" prop="ScheduleIntervalSeconds">
                <el-input-number v-model="form.ScheduleIntervalSeconds"></el-input-number>
              </el-form-item>

              <el-form-item>
                <el-button size="small" type="primary" @click.prevent="saveConfig()">Submit</el-button>
                <el-button size="small" @click.prevent="reset()">Reset</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>

        </el-tabs>


      </el-col>
    </el-row>
  </div>
</template>

<script>
import {getConfig, updateConfig} from '@/api/config'

export default {
  data() {
    return {
      loading:false,
      form: {
        Description: "",
        HttpThreadPoolSize: "",
        JWTEnabled: "",
        JWTRedirectUrl: "",
        LogLevel: "",
        RestEnabled: "",
        RestListenAddress: "",
        RestListenPort: "",
        SSLCertificateFile: "",
        SSLCertificateKeyFile: "",
        SSLEnabled: "",
        ScheduleIntervalSeconds: ""
      },
      configData:null,
      options:[{
        label: "DEBUG",
        value: "DEBUG"
      },{
        label: "INFO",
        value: "INFO"
      },{
        label: "WARN",
        value: "WARN"
      },{
        label: "ERROR",
        value: "ERROR"
      }]
    }
  },
  mounted() {
    this.refresh();
  },
  methods: {
    setConfig(data){
      this.configData = data;
      for(let prop in this.form){
        if(data.hasOwnProperty(prop)){
          this.form[prop] = data[prop];
        }
      }
    },
    refresh(){
      this.loading = true;
      getConfig().then((res)=>{
        this.setConfig(res.data);
        this.loading = false;
      }, (res)=>{
        this.loading = false;
        this.$message.error('Get configuration failed. ' + res.data, 5000);
      });
    },
    reset(){
      this.setConfig(this.configData);
    },
    saveConfig(){
      this.$refs["form"].validate((valid) => {
        this.loading = true;
        if (valid) {
          updateConfig(this.form).then((res)=>{
            this.$message.success('Configuration update successfully.', 5000);
            this.form = res.data;
            this.loading = false;
          }, (res)=>{
            this.loading = false;
          });
        } else {
          this.loading = false;
          return false;
        }
      });
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>
