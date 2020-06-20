<template>
  <div class="app-container" style="clear:both;" v-loading="loading">
    <el-row >
      <el-col :span="24">
        <el-tabs type="border-card">
          <el-tab-pane style="minWidth:600px;">
            <span slot="label"><i class="el-icon-s-operation"></i> Configuration</span>
            <el-form ref="form" :model="form" label-width="260px">
              <el-collapse v-model="activeNames">
                <el-collapse-item title="Basic" name="1">
				  <el-form-item label="Version" prop="Version">
                    <el-input v-model="form.Version" readonly="true" :disabled="true"></el-input>
                  </el-form-item>
                  <el-form-item label="Description" prop="Description">
                    <el-input v-model="form.Description"></el-input>
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
                  <el-form-item label="Schedule period seconds" prop="ScheduleIntervalSeconds">
                    <el-input-number v-model="form.ScheduleIntervalSeconds"></el-input-number>
                  </el-form-item>
                <el-form-item label="Default exec user" prop="DefaultExecUser">
                    <el-input v-model="form.DefaultExecUser"></el-input>
                  </el-form-item>
                <el-form-item label="Working dir" prop="WorkingDirectory">
                    <el-input v-model="form.WorkingDirectory"></el-input>
                  </el-form-item>
                </el-collapse-item>
				
                <el-collapse-item title="Rest" name="2">
                  <el-form-item label="Http thread pool size" prop="REST.HttpThreadPoolSize">
                    <el-input-number v-model="form.REST.HttpThreadPoolSize"></el-input-number>
                  </el-form-item>
                  <el-form-item label="Prometheus exporter listen port" prop="REST.PrometheusExporterListenPort">
                    <el-input-number v-model="form.REST.PrometheusExporterListenPort" :min="0" :max="65534"></el-input-number>
                  </el-form-item>
                  <el-form-item label="Rest enabled" prop="REST.RestEnabled">
                    <el-switch
                      v-model="form.REST.RestEnabled"
                      active-text="Yes"
                      :active-value="true"
                      inactive-text="No"
                      :inactive-value="false">
                    </el-switch>
                  </el-form-item>
                  <el-form-item label="Rest listen address" prop="REST.RestListenAddress">
                    <el-input v-model="form.REST.RestListenAddress"></el-input>
                  </el-form-item>
                  <el-form-item label="Rest listen port" prop="REST.RestListenPort">
                    <el-input-number v-model="form.REST.RestListenPort" :min="1024" :max="65534"></el-input-number>
                  </el-form-item>
                  <el-form-item label="SSL certificate file" prop="REST.SSL.SSLCertificateFile">
                    <el-input v-model="form.REST.SSL.SSLCertificateFile"></el-input>
                  </el-form-item>
                  <el-form-item label="SSL certificate key file" prop="REST.SSL.SSLCertificateKeyFile">
                    <el-input v-model="form.REST.SSL.SSLCertificateKeyFile"></el-input>
                  </el-form-item>
                  <el-form-item label="SSL enabled" prop="REST.SSL.SSLEnabled">
                    <el-switch
                      v-model="form.REST.SSL.SSLEnabled"
                      active-text="Yes"
                      :active-value="true"
                      inactive-text="No"
                      :inactive-value="false">
                    </el-switch>
                  </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="Security" name="3">
                  <el-form-item label="JWT enabled" prop="Security.JWTEnabled">
                    <el-switch
                      v-model="form.Security.JWTEnabled"
                      active-text="Yes"
                      :active-value="true"
                      inactive-text="No"
                      :inactive-value="false">
                    </el-switch>
                  </el-form-item>
                  <el-form-item label="Encrypt key" prop="Security.EncryptKey">
                    <el-switch
                      v-model="form.Security.EncryptKey"
                      active-text="Yes"
                      :active-value="true"
                      inactive-text="No"
                      :inactive-value="false">
                    </el-switch>
                  </el-form-item>

                </el-collapse-item>
                <el-collapse-item title="Consul" name="4">
                  <el-form-item label="DataCenter" prop="Consul.datacenter">
                    <el-input v-model="form.Consul.datacenter"></el-input>
                  </el-form-item>
                  <el-form-item label="Master node" prop="Consul.is_master">
                    <el-switch
                      v-model="form.Consul.is_master"
                      active-text="Yes"
                      :active-value="true"
                      inactive-text="No"
                      :inactive-value="false">
                    </el-switch>
                  </el-form-item>
                  <el-form-item label="Worker node" prop="Consul.is_node">
                    <el-switch
                      v-model="form.Consul.is_node"
                      active-text="Yes"
                      :active-value="true"
                      inactive-text="No"
                      :inactive-value="false">
                    </el-switch>
                  </el-form-item>
				  <el-form-item label="Sync Consul user role" prop="Consul.enable_consul_security">
                    <el-switch
                      v-model="form.Consul.enable_consul_security"
                      active-text="Yes"
                      :active-value="true"
                      inactive-text="No"
                      :inactive-value="false">
                    </el-switch>
                  </el-form-item>
                  <el-form-item label="Session TTL" prop="Consul.session_TTL">
                    <el-input-number v-model="form.Consul.session_TTL"></el-input-number>
                  </el-form-item>
                  <el-form-item label="Consul URL" prop="Consul.url">
                    <el-input v-model="form.Consul.url"></el-input>
                  </el-form-item>
                </el-collapse-item>
              </el-collapse>

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
      activeNames:['1','2','3','4'],
      form: {
        Version: "",
        Description: "",
        DefaultExecUser: "",
        WorkingDirectory: "",
        REST:{
          HttpThreadPoolSize: "",
          RestEnabled: "",
          RestListenAddress: "",
          RestListenPort: null,
          PrometheusExporterListenPort: 0,
          SSL:{
            SSLCertificateFile: "",
            SSLCertificateKeyFile: "",
            SSLEnabled: "",
          }
        },
        Security:{
          JWTEnabled: "",
          EncryptKey:false,
        },
        LogLevel: "",
        ScheduleIntervalSeconds: "",
        Consul:{
          datacenter:"",
          is_master:false,
          is_node:false,
          session_TTL:null,
          enable_consul_security:false,
          url:""
        }
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
<style>
.el-collapse-item__header{
  font-size:14px;
  font-weight: bold;
}
</style>
