<template>
  <div class="app-container" style="clear: both" v-loading="loading">
    <el-row>
      <el-col :span="24">
        <el-tabs type="border-card">
          <el-tab-pane style="minwidth: 600px">
            <span slot="label">
              <i class="el-icon-s-operation"></i> Configuration
            </span>
            <el-form ref="form" :model="form" label-width="260px">
              <el-collapse v-model="activeNames">
                <el-collapse-item title="Basic" name="1">
                  <el-form-item label="Version" prop="Version">
                    <el-input
                      v-model="form.Version"
                      readonly="true"
                      :disabled="true"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="Description" prop="Description">
                    <el-input v-model="form.Description"></el-input>
                  </el-form-item>
                  <el-form-item label="Log level" prop="LogLevel">
                    <el-select
                      v-model="form.LogLevel"
                      placeholder="Please select"
                    >
                      <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="Schedule period seconds"
                    prop="ScheduleIntervalSeconds"
                  >
                    <el-input-number
                      v-model="form.ScheduleIntervalSeconds"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item
                    label="Default exec user"
                    prop="DefaultExecUser"
                  >
                    <el-input v-model="form.DefaultExecUser"></el-input>
                  </el-form-item>
                  <el-form-item label="Working dir" prop="WorkingDirectory">
                    <el-input v-model="form.WorkingDirectory"></el-input>
                  </el-form-item>
                </el-collapse-item>

                <el-collapse-item title="Rest" name="2">
                  <el-form-item
                    label="Http thread pool size"
                    prop="REST.HttpThreadPoolSize"
                  >
                    <el-input-number
                      v-model="form.REST.HttpThreadPoolSize"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item
                    label="Prometheus exporter listen port"
                    prop="REST.PrometheusExporterListenPort"
                  >
                    <el-input-number
                      v-model="form.REST.PrometheusExporterListenPort"
                      :min="0"
                      :max="65534"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item label="Rest enabled" prop="REST.RestEnabled">
                    <el-switch
                      v-model="form.REST.RestEnabled"
                      active-text="Yes"
                      :active-value="true"
                      inactive-text="No"
                      :inactive-value="false"
                    ></el-switch>
                  </el-form-item>
                  <el-form-item
                    label="Rest listen address"
                    prop="REST.RestListenAddress"
                  >
                    <el-input v-model="form.REST.RestListenAddress"></el-input>
                  </el-form-item>
                  <el-form-item
                    label="Rest listen port"
                    prop="REST.RestListenPort"
                  >
                    <el-input-number
                      v-model="form.REST.RestListenPort"
                      :min="1024"
                      :max="65534"
                    ></el-input-number>
                  </el-form-item>

                  <el-form-item
                    label="Separate REST TCP listen port"
                    prop="REST.SeparateRestInternalPort"
                  >
                    <el-input-number
                      v-model="form.REST.SeparateRestInternalPort"
                      :min="1024"
                      :max="65534"
                    ></el-input-number>
                  </el-form-item>

                  <el-form-item
                    label="SSL certificate file"
                    prop="REST.SSL.SSLCertificateFile"
                  >
                    <el-input
                      v-model="form.REST.SSL.SSLCertificateFile"
                    ></el-input>
                  </el-form-item>
                  <el-form-item
                    label="SSL certificate key file"
                    prop="REST.SSL.SSLCertificateKeyFile"
                  >
                    <el-input
                      v-model="form.REST.SSL.SSLCertificateKeyFile"
                    ></el-input>
                  </el-form-item>
                  <el-form-item label="SSL enabled" prop="REST.SSL.SSLEnabled">
                    <el-switch
                      v-model="form.REST.SSL.SSLEnabled"
                      active-text="Yes"
                      :active-value="true"
                      inactive-text="No"
                      :inactive-value="false"
                    ></el-switch>
                  </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="JWT" name="3">
                  <el-form-item label="JWT enabled" prop="REST.JWT.JWTEnabled">
                    <el-switch
                      v-model="form.REST.JWT.JWTEnabled"
                      active-text="Yes"
                      :active-value="true"
                      inactive-text="No"
                      :inactive-value="false"
                    ></el-switch>
                  </el-form-item>
                  <el-form-item label="JWT Salt" prop="REST.JWT.JWTSalt">
                    <el-input v-model="form.REST.JWT.JWTSalt"></el-input>
                  </el-form-item>
                  <el-form-item label="JWT Interface" prop="REST.JWT.SecurityInterface">
                    <el-select
                      v-model="form.REST.JWT.SecurityInterface"
                      placeholder="Please select"
                    >
                      <el-option
                        v-for="item in JWTOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-collapse-item>
                <el-collapse-item title="Consul" name="4">
                  <el-form-item label="Main node" prop="Consul.IsMainNode">
                    <el-switch
                      v-model="form.Consul.IsMainNode"
                      active-text="Yes"
                      :active-value="true"
                      inactive-text="No"
                      :inactive-value="false"
                    ></el-switch>
                  </el-form-item>
                  <el-form-item label="Worker node" prop="Consul.IsWorkerNode">
                    <el-switch
                      v-model="form.Consul.IsWorkerNode"
                      active-text="Yes"
                      :active-value="true"
                      inactive-text="No"
                      :inactive-value="false"
                    ></el-switch>
                  </el-form-item>
                  <el-form-item
                    label="Store user role in Consul"
                    prop="Consul.EnableConsulSecurity"
                  >
                    <el-switch
                      v-model="form.Consul.EnableConsulSecurity"
                      active-text="Yes"
                      :active-value="true"
                      inactive-text="No"
                      :inactive-value="false"
                    ></el-switch>
                  </el-form-item>
                  <el-form-item label="Session TTL" prop="Consul.SessionTTL">
                    <el-input-number
                      v-model="form.Consul.SessionTTL"
                    ></el-input-number>
                  </el-form-item>
                  <el-form-item label="Consul URL" prop="Consul.Url">
                    <el-input v-model="form.Consul.Url"></el-input>
                  </el-form-item>
                  <el-form-item
                    label="App Mesh expose URL"
                    prop="Consul.AppmeshProxyUrl"
                  >
                    <el-input
                      v-model="form.Consul.AppmeshProxyUrl"
                    ></el-input>
                  </el-form-item>
                </el-collapse-item>
              </el-collapse>

              <el-form-item>
                <el-button
                  size="small"
                  type="primary"
                  @click.prevent="saveConfig()"
                  >Submit</el-button
                >
                <el-button size="small" @click.prevent="reset()"
                  >Reset</el-button
                >
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import configService from "@/services/config";

export default {
  data() {
    return {
      loading: false,
      activeNames: ["1", "2", "3", "4"],
      form: {
        Version: "",
        Description: "",
        DefaultExecUser: "",
        WorkingDirectory: "",
        REST: {
          HttpThreadPoolSize: 6,
          RestEnabled: true,
          SeparateRestInternalPort: 6059,
          RestListenAddress: "",
          RestListenPort: 6060,
          PrometheusExporterListenPort: 6061,
          SSL: {
            SSLCertificateFile: "",
            SSLCertificateKeyFile: "",
            SSLEnabled: "",
          },
          JWT: {
            JWTSalt: "",
            JWTEnabled: false,
            SecurityInterface: "",
          },
        },
        LogLevel: "",
        ScheduleIntervalSeconds: 2,
        Consul: {
          IsMainNode: false,
          IsWorkerNode: false,
          SessionTTL: null,
          EnableConsulSecurity: false,
          Url: "",
          AppmeshProxyUrl: "",
        },
      },
      configData: null,
      options: [
        {
          label: "NOTEST",
          value: "NOTEST",
        },
        {
          label: "DEBUG",
          value: "DEBUG",
        },
        {
          label: "INFO",
          value: "INFO",
        },
        {
          label: "NOTICE",
          value: "NOTICE",
        },
        {
          label: "WARN",
          value: "WARN",
        },
        {
          label: "ERROR",
          value: "ERROR",
        },
      ],
      JWTOptions: [
        {
          label: "json",
          value: "json",
        },
        {
          label: "ldap",
          value: "ldap",
        },
      ],
    };
  },
  mounted() {
    this.refresh();
  },
  methods: {
    refresh() {
      configService.refresh(this);
    },
    reset() {
      configService.setConfig(this, this.configData);
    },
    saveConfig() {
      configService.saveConfig(this);
    },
  },
};
</script>

<style scoped>
.line {
  text-align: center;
}
</style>
<style>
.el-collapse-item__header {
  font-size: 14px;
  font-weight: bold;
}
</style>
