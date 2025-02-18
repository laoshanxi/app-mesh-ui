<template>
  <div v-loading="loading" class="app-container" style="clear: both">
    <el-row>
      <el-col :span="24">
        <el-tabs ref="tabs" v-model="activeTab" type="border-card">
          <el-tab-pane name="config" style="min-width: 600px">
            <span slot="label">
              <i class="el-icon-s-operation" /> Configuration
            </span>
            <el-form ref="form" :model="form" :rules="rules" label-width="260px">
              <el-collapse v-model="activeNames">
                <el-collapse-item name="1">
                  <template slot="title">
                    <i class="el-icon-setting" style="margin-right: 8px;" />
                    Basic
                  </template>
                  <el-form-item label="Version" prop="Version">
                    <el-input v-model="form.Version" :readonly="true" :disabled="true" />
                  </el-form-item>
                  <el-form-item label="Description" prop="BaseConfig.Description">
                    <el-input v-model="form.BaseConfig.Description" />
                  </el-form-item>
                  <el-form-item label="Log level" prop="BaseConfig.LogLevel">
                    <el-select v-model="form.BaseConfig.LogLevel" placeholder="Please select">
                      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                        <el-tooltip :content="item.description" placement="right">
                          <span>{{ item.label }}</span>
                        </el-tooltip>
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="Schedule period seconds" prop="BaseConfig.ScheduleIntervalSeconds">
                    <el-input-number v-model="form.BaseConfig.ScheduleIntervalSeconds" />
                  </el-form-item>
                  <el-form-item label="Default exec user" prop="BaseConfig.DefaultExecUser">
                    <el-input v-model="form.BaseConfig.DefaultExecUser" />
                  </el-form-item>

                  <el-form-item label="Disable exec user" prop="BaseConfig.DisableExecUser">
                    <el-switch v-model="form.BaseConfig.DisableExecUser" active-text="Yes" :active-value="true"
                      inactive-text="No" :inactive-value="false" />
                  </el-form-item>

                  <el-form-item label="Working dir" prop="BaseConfig.WorkingDirectory">
                    <el-input v-model="form.BaseConfig.WorkingDirectory" />
                  </el-form-item>
                  <el-form-item label="Posix timezone" prop="BaseConfig.PosixTimezone">
                    <el-input v-model="form.BaseConfig.PosixTimezone" />
                  </el-form-item>
                </el-collapse-item>

                <el-collapse-item name="2">
                  <template slot="title">
                    <i class="el-icon-connection" style="margin-right: 8px;" />
                    Web
                  </template>
                  <el-form-item label="Rest enabled" prop="REST.RestEnabled">
                    <el-switch v-model="form.REST.RestEnabled" active-text="Yes" :active-value="true" inactive-text="No"
                      :inactive-value="false" />
                  </el-form-item>
                  <el-form-item label="Http thread pool size" prop="REST.HttpThreadPoolSize">
                    <el-input-number v-model="form.REST.HttpThreadPoolSize" />
                  </el-form-item>
                  <el-form-item label="Prometheus exporter listen port" prop="REST.PrometheusExporterListenPort">
                    <el-input-number v-model="form.REST.PrometheusExporterListenPort" :min="0" :max="65534" />
                  </el-form-item>

                  <el-form-item label="Rest listen address" prop="REST.RestListenAddress">
                    <el-input v-model="form.REST.RestListenAddress" />
                  </el-form-item>
                  <el-form-item label="Rest listen port" prop="REST.RestListenPort">
                    <el-input-number v-model="form.REST.RestListenPort" :min="1024" :max="65534" />
                  </el-form-item>

                  <el-form-item label="TCP rest listen port" prop="REST.RestTcpPort">
                    <el-input-number v-model="form.REST.RestTcpPort" :min="1024" :max="65534" />
                  </el-form-item>

                  <el-form-item label="SSL verify server" prop="REST.SSL.VerifyServer">
                    <el-switch v-model="form.REST.SSL.VerifyServer" active-text="Yes" :active-value="true"
                      inactive-text="No" :inactive-value="false" />
                  </el-form-item>
                  <el-form-item label="SSL verify client" prop="REST.SSL.VerifyClient">
                    <el-switch v-model="form.REST.SSL.VerifyClient" active-text="Yes" :active-value="true"
                      inactive-text="No" :inactive-value="false" />
                  </el-form-item>
                  <el-form-item label="Forwarding SSL verify" prop="REST.SSL.VerifyServerDelegate">
                    <el-switch v-model="form.REST.SSL.VerifyServerDelegate" active-text="Yes" :active-value="true"
                      inactive-text="No" :inactive-value="false" />
                  </el-form-item>

                  <el-form-item label="SSL certificate file" prop="REST.SSL.SSLCertificateFile">
                    <el-input v-model="form.REST.SSL.SSLCertificateFile" />
                  </el-form-item>
                  <el-form-item label="SSL certificate key file" prop="REST.SSL.SSLCertificateKeyFile">
                    <el-input v-model="form.REST.SSL.SSLCertificateKeyFile" />
                  </el-form-item>
                  <el-form-item label="SSL client certificate file" prop="REST.SSL.SSLClientCertificateFile">
                    <el-input v-model="form.REST.SSL.SSLClientCertificateFile" />
                  </el-form-item>
                  <el-form-item label="SSL client certificate key file" prop="REST.SSL.SSLClientCertificateKeyFile">
                    <el-input v-model="form.REST.SSL.SSLClientCertificateKeyFile" />
                  </el-form-item>
                  <el-form-item label="SSL CA file" prop="REST.SSL.SSLCaPath">
                    <el-input v-model="form.REST.SSL.SSLCaPath" />
                  </el-form-item>
                </el-collapse-item>
                <el-collapse-item name="3">
                  <template slot="title">
                    <i class="el-icon-key" style="margin-right: 8px;" />
                    JWT
                  </template>
                  <el-form-item label="JWT Salt" prop="REST.JWT.JWTSalt">
                    <el-input v-model="form.REST.JWT.JWTSalt" />
                  </el-form-item>
                  <el-form-item label="JWT Algorithm" prop="REST.JWT.Algorithm">
                    <el-select v-model="form.REST.JWT.Algorithm" placeholder="Please select">
                      <el-option label="HS256" value="HS256" />
                      <el-option label="RS256" value="RS256" />
                      <el-option label="ES256" value="ES256" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="JWT Issuer" prop="REST.JWT.Issuer">
                    <el-input v-model="form.REST.JWT.Issuer" />
                  </el-form-item>
                  <el-form-item label="JWT Audience" prop="REST.JWT.Audience">
                    <el-select v-model="form.REST.JWT.Audience" multiple filterable allow-create
                      :default-first-option="true" placeholder="Enter audience values">
                      <el-option v-for="item in form.REST.JWT.Audience" :key="item" :label="item" :value="item">
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="JWT Interface" prop="REST.JWT.SecurityInterface">
                    <el-select v-model="form.REST.JWT.SecurityInterface" placeholder="Please select">
                      <el-option v-for="item in JWTOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-collapse-item>
              </el-collapse>
            </el-form>
          </el-tab-pane>
          <el-tab-pane name="labels" style="min-width: 600px">
            <span slot="label">
              <i class="el-icon-collection-tag" /> Labels
            </span>
            <el-row>
              <el-table :key="tableKey" v-loading="listLoading" :data="labels" element-loading-text="Loading" border
                style="width: 100%" height="100%" class="fix-table" highlight-current-row
                @current-change="currentRowChange">
                <el-table-column label="Key" width="300">
                  <template slot-scope="scope">
                    <el-input v-if="scope.row.isEdit" v-model="scope.row.key" size="mini"
                      placeholder="Please enter key"></el-input>
                    <span v-else>{{ scope.row.key }}</span>
                  </template>
                </el-table-column>

                <el-table-column label="Value">
                  <template slot-scope="scope">
                    <el-input v-if="scope.row.isEdit" v-model="scope.row.value" size="mini"
                      placeholder="Please enter value"></el-input>
                    <span v-else>{{ scope.row.value }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Action" width="260">
                  <template slot-scope="scope">
                    <el-button v-if="!scope.row.isEdit" type="text" icon="el-icon-edit" :disabled="isEdit"
                      @click="editLabel(scope.row)">
                      Edit
                    </el-button>
                    <el-button v-if="scope.row.isEdit" type="text" icon="el-icon-save" @click="cancelUpdate(scope.row)">
                      Cancel
                    </el-button>
                    <el-button v-if="scope.row.isEdit" type="text" icon="el-icon-save" @click="updateLabel(scope.row)">
                      Save
                    </el-button>
                    <el-button v-if="!scope.row.isNew" type="text" icon="el-icon-delete" :disabled="isEdit"
                      @click="removeLabel(scope.row)">
                      Remove
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <div class="control">
      <el-button v-show="isConfigTab" size="small" type="primary" @click.prevent="saveConfig()">
        Save
      </el-button>
      <el-button v-show="isConfigTab" size="small" @click.prevent="reset()">
        Reset
      </el-button>
      <el-button-group v-show="!isConfigTab">
        <el-button size="small" type="primary" icon="el-icon-plus" :disabled="isEdit" @click="addLabel()">
          Add
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import configService from "@/services/config";
import labelsService from "@/services/labels";

export default {
  data() {
    return {
      loading: false,
      activeNames: ["1", "2", "3", "4"],
      activeTab: 'config',
      passwordType: 'password',
      form: {
        Version: "",
        BaseConfig: {
          Description: "MYHOST",
          DefaultExecUser: "",
          DisableExecUser: false,
          ScheduleIntervalSeconds: 1,
          WorkingDirectory: "",
          LogLevel: "INFO",
          PosixTimezone: "+08",
        },
        REST: {
          RestEnabled: true,
          RestListenAddress: "localhost",
          RestListenPort: 6060,
          RestTcpPort: 6059,
          PrometheusExporterListenPort: 6061,
          HttpThreadPoolSize: 2,
          SSL: {
            SSLCaPath: "ssl/ca.pem",
            SSLCertificateFile: "ssl/server.pem",
            SSLCertificateKeyFile: "ssl/server-key.pem",
            SSLClientCertificateFile: "ssl/client.pem",
            SSLClientCertificateKeyFile: "ssl/client-key.pem",
            VerifyServer: true,
            VerifyClient: false,
            VerifyServerDelegate: false,
          },
          JWT: {
            JWTSalt: "HelloAppMesh",
            Algorithm: "HS256",
            Issuer: "",
            Audience: ["appmesh-service", "your-service-api"],
            SecurityInterface: "local",
          },
        },
      },
      configData: null,
      rules: {
        'BaseConfig.LogLevel': [
          { required: true, message: 'Log level is required', trigger: 'change' }
        ],
        'REST.RestListenPort': [
          { type: 'number', min: 1024, max: 65534, message: 'Port must be between 1024-65534', trigger: 'blur' }
        ]
      },
      options: [
        {
          label: "DEBUG",
          value: "DEBUG",
          description: "Debug level messages"
        },
        {
          label: "INFO",
          value: "INFO",
          description: "Info level messages"
        },
        {
          label: "NOTICE",
          value: "NOTICE",
          description: "Notice level messages"
        },
        {
          label: "WARN",
          value: "WARN",
          description: "Warning level messages"
        },
        {
          label: "ERROR",
          value: "ERROR",
          description: "Error level messages"
        },
      ],
      JWTOptions: [
        {
          label: "json",
          value: "json",
        },
        {
          label: "consul",
          value: "consul",
        },
        {
          label: "ldap",
          value: "ldap",
        },
        {
          label: "oauth2",
          value: "oauth2",
        },
      ],
      value: '',
      inputValue: '',
      labels: [],
      tableKey: 0,
      isSelected: false,
      listLoading: false,
      isEdit: false,
      currentRow: null,
    };
  },
  computed: {
    isConfigTab() {
      return this.activeTab === 'config';
    }
  },
  mounted() {
    this.refresh();
  },
  methods: {
    refresh() {
      configService.refresh(this);
      this.refreshLabels();
    },
    saveConfig() {
      configService.saveConfig(this);
    },
    editLabel(row) {
      this.isEdit = true;
      this.$set(row, "isEdit", true);
    },
    cancelUpdate(row) {
      this.isEdit = false;
      this.$set(row, "isEdit", false);
      if (row.isNew) {
        this.labels.splice(row.index, 1);
      }
    },
    updateLabel(row) {
      labelsService.updateLabel(this, row);
    },
    removeLabel(row) {
      labelsService.deleteLabel(this, row);
    },
    refreshLabels() {
      this.labels = [];
      this.isEdit = false;
      labelsService.getLabels(this);
    },
    addLabel() {
      let index = this.labels.length;
      this.labels.push({
        key: "",
        value: "",
        isEdit: true,
        isNew: true,
        index: index,
      });
      this.isEdit = true;
    },
    currentRowChange(currentRow, oldCurrentRow) {
      this.currentRow = currentRow;
      if (!currentRow) {
        this.isSelected = false;
        return;
      }
      this.isSelected = true;
    },
    showPwd() {
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
    },
  },
};
</script>

<style scoped>
.line {
  text-align: center;
}

.fix-table {
  margin-top: 10px;
}

.show-pwd {
  position: absolute;
  right: 5px;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #889aa4;
  cursor: pointer;
  user-select: none;
  padding: 0 5px;
}
</style>

<style>
.el-collapse-item__header {
  font-size: 14px;
  font-weight: bold;
}

.el-collapse-item .el-collapse-item__header {
  background-color: #d6e7fa;
}

.el-collapse-item__header i {
  margin-right: 8px;
  color: #409EFF;
}

.control {
  padding-top: 10px;
  text-align: center;
}
</style>
