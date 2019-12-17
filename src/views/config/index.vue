<template>
  <div class="app-container" style="clear:both;" v-loading="loading">
    <el-row >
      <el-col :span="24">
        <el-tabs type="border-card">
          <el-tab-pane style="minWidth:600px;">
            <span slot="label"><i class="el-icon-s-operation"></i> Configuration</span>
            <el-form ref="form" :model="form" label-width="260px">
              <el-form-item label="Description" prop="Description">
                <el-input v-model="form.Description"></el-input>
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
              <el-form-item label="Rest listen port" prop="RestListenPort">
                <el-input-number v-model="form.RestListenPort" :min="1024" :max="65534"></el-input-number>
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
              <el-form-item label="Prometheus exporter listen port" prop="PrometheusExporterListenPort">
                <el-input-number v-model="form.PrometheusExporterListenPort" :min="0" :max="65534"></el-input-number>
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
import configService from '@/services/config'

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
        RestListenPort: null,
        SSLCertificateFile: "",
        SSLCertificateKeyFile: "",
        SSLEnabled: "",
        ScheduleIntervalSeconds: "",
        PrometheusExporterListenPort: 0
      },
      configData:null,
      options:[{
        label: "NOTEST",
        value: "NOTEST"
      },{
        label: "DEBUG",
        value: "DEBUG"
      },{
        label: "INFO",
        value: "INFO"
      },{
        label: "NOTICE",
        value: "NOTICE"
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
    refresh(){
      configService.refresh(this);
    },
    reset(){
      configService.setConfig(this, this.configData);
    },
    saveConfig(){
      configService.saveConfig(this);
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>
