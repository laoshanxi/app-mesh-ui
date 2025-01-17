<template>
  <div class="app-container">
    <el-row style="color: #909399">
      <h4>Applications</h4>
    </el-row>
    <el-row>
      <el-button-group>
        <el-button type="primary" icon="el-icon-plus" @click="btnClick('register')">
          Add
        </el-button>
        <el-button type="success" icon="el-icon-edit" :disabled="!isSelected" @click="btnClick('update')">
          Edit
        </el-button>
        <el-button type="danger" icon="el-icon-delete" :disabled="!isSelected" @click="btnClick('delete')">
          Delete
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button type="success" icon="el-icon-open" :disabled="!isSelected || isEnabled" @click="btnClick('enable')">
          Enable
        </el-button>
        <el-button type="warning" icon="el-icon-turn-off" :disabled="!isSelected || !isEnabled"
          @click="btnClick('disable')">
          Disable
        </el-button>
      </el-button-group>
    </el-row>
    <el-row>
      <el-table :key="tableKey" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        style="width: 100%" height="100%" class="fix-table" :fit="true" highlight-current-row
        @current-change="currentRowChange">
        <el-table-column label="Name" width="200">
          <template slot-scope="scope">

            <i v-if="scope.row.health == 0" class="el-icon-success"
              style="color: #85ce61; font-size: 18px; vertical-align: middle" />
            <i v-else class="el-icon-warning" style="color: #f56c6c; font-size: 18px; vertical-align: middle" />

            <el-link :underline="true" :title="scope.row.desc" @click="showDetail()">
              {{ scope.row.name }}
            </el-link>

          </template>
        </el-table-column>
        <el-table-column label="Owner" width="100">
          <template slot-scope="scope">
            {{ scope.row.owner | formatEmpty }}
          </template>
        </el-table-column>
        <el-table-column class-name="status-col" label="State" width="110">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status == 1" :type="'success'">
              Enabled
            </el-tag>
            <el-tag v-else :type="'info'">
              Disabled
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="PID" width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.pstree">
              <el-link :underline="true" :title="scope.row.pstree">
                {{ scope.row.pid | formatEmpty }}
              </el-link>
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="Memory" width="110">
          <template slot-scope="scope">
            {{ scope.row.memory | formatMemory }}
          </template>
        </el-table-column>
        <el-table-column label="%Cpu" width="110">
          <template slot-scope="scope">
            {{ scope.row.cpu | formatCpu }}
          </template>
        </el-table-column>
        <el-table-column label="Return" width="70">
          <template slot-scope="scope">
            {{ scope.row.return_code | formatEmpty }}
          </template>
        </el-table-column>
        <el-table-column label="Starts" width="70">
          <template slot-scope="scope">
            {{ scope.row.starts | formatEmpty }}
          </template>
        </el-table-column>
        <el-table-column label="Age" width="120">
          <template slot-scope="scope">
            {{ scope.row.age | formatEmpty }}
          </template>
        </el-table-column>
        <el-table-column label="Duration" width="120">
          <template slot-scope="scope">
            {{ scope.row.duration | formatEmpty }}
          </template>
        </el-table-column>
        <el-table-column prop="last_start_time" label="Last Start Time" width="230">
          <template slot-scope="scope">
            <span v-if="scope.row.last_start_time">
              <el-link :underline="true" @click="showLog(scope.row)" title="Show log">
                <i class="el-icon-document"></i>
                <i class="el-icon-time" style="margin-right: 5px" />
                {{ scope.row.last_start_time | formatDate }}
              </el-link>
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <af-table-column label="Command">
          <template slot-scope="scope">
            {{ scope.row.command | formatEmpty }}
          </template>
        </af-table-column>
      </el-table>
    </el-row>

    <!-- Add application dialog -->
    <!-- <el-dialog title="Add Application" :visible.sync="registerFormVisible" fullscreen="false"> -->
    <el-drawer custom-class="right-drawer" :title="drawerTitle" :visible.sync="registerFormVisible" size="60%">
      <app-reg :prop-form="selectedForm" @close="registerFormVisible = false" @success="regSuccess()" />
    </el-drawer>

    <!-- show application detail -->
    <el-drawer v-loading="isLoadingDetail" :visible.sync="isShowDetail" size="50%">
      <span slot="title">
        <span class="el-icon-view">
          &nbsp;&nbsp;{{
            currentRow ? currentRow.name : "Please select one application"
          }}
          <i v-if="currentRow && currentRow.docker_image" class="iconfont icon-docker" />
        </span>
      </span>
      <div class="detail-card">
        <app-detail :record="currentRow" />
      </div>
    </el-drawer>

    <!-- show application logs -->
    <el-drawer v-loading="isLoadingLog" :visible.sync="isShowLog" size="50%">
      <span slot="title">
        <span class="el-icon-document">
          &nbsp;&nbsp;{{
            currentRow ? currentRow.name : "Please select one application"
          }}
        </span>
      </span>
      <div class="detail-card">
        <app-log ref="appLog" :loginfo="appLogInfo" :app="currentRow" @startLoading="isLoadingLog = true"
          @loadingDone="logChange" />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import applications from "@/services/applications";
import { parseTime } from "@/utils";
import { MessageBox, Message } from "element-ui";
import AppDetail from "./appDetail";
import AppLog from "./appLog";
import AppReg from "./appReg";

export default {
  components: {
    AppDetail,
    AppLog,
    AppReg,
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "gray",
        deleted: "danger",
      };
      return statusMap[status];
    },
  },
  data() {
    return {
      isShowLog: false,
      isLoadingLog: false,
      appLogInfo: null,
      isLoadingDetail: false,
      isShowDetail: false,
      isSelected: false,
      isEnabled: false,
      tableKey: 0,
      total: 15,
      pageSize: 15,
      currentPage: 1,
      list: null,
      listLoading: true,
      application: null,
      currentRow: null,
      formLabelWidth: "100px",
      registerFormVisible: false,
      selectedForm: {},
      drawerTitle: "Add Application"
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    logChange(loginfo) {
      this.isLoadingLog = false;
      this.appLogInfo = loginfo;
    },
    regSuccess() {
      this.registerFormVisible = false;
      this.fetchData();
    },
    showDetail() {
      this.isShowDetail = true;
    },
    showLog(curRow) {
      this.appLogInfo = null;
      this.currentRow = null;
      this.currentRow = curRow;
      if (this.$refs["appLog"]) {
        this.$refs["appLog"].initCurPage();
      }
      this.isShowLog = true;
      if (curRow.stdout_cache_size == 0) {
        return;
      }
      this.getAppLogByName(this.currentRow.name);
    },

    btnClick(action) {
      switch (action) {
        case "register": {
          this.selectedForm = {};
          this.registerFormVisible = true;
          this.drawerTitle = "Add Application";
          return;
        }
        case "update": {
          this.selectedForm = this.currentRow;
          this.registerFormVisible = true;
          this.drawerTitle = "Edit Application";
          return;
        }
        case "delete": {
          applications.removeApp(this);
          return;
        }
        case "enable": {
          applications.enableApp(this);
          return;
        }
        case "disable": {
          applications.disableApp(this);
          return;
        }
      }
    },

    currentRowChange(currentRow, oldCurrentRow) {
      console.info(this.list, currentRow);
      this.currentRow = currentRow;
      if (!currentRow) {
        this.isSelected = false;
        this.isEnabled = false;
        return;
      }
      this.isSelected = true;
      if (currentRow.status == 1) {
        this.isEnabled = true;
      } else {
        this.isEnabled = false;
      }
    },
    handleSizeChange(value) {
      this.pageSize = value;
    },
    handleCurrentChange() {
      console.info(arguments);
    },
    fetchData() {
      applications.getAppList(this);
    },
    getAppByName(name) {
      applications.getAppByName(this, name);
    },
    getAppLogByName(name) {
      applications.getAppLogByName(this, name, 0);
    },
  },
};
</script>
<style lang="scss" scoped>
.el-row {
  margin-bottom: 8px;
}

.el-input {
  width: 200px;
  margin-right: 10px;
}

.register-card {
  height: calc(100vh - 136px) !important;
  overflow-y: auto;
}

.register-card .el-input {
  width: 350px;
  margin-right: 10px;
}

.right-drawer .dialog-footer {
  border-top: 1px solid #bfcbd9;
  background-color: #ffffff;
  width: 100%;
  position: absolute;
  bottom: 0px;
  text-align: right;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-right: 30px;
}

.detail-card {
  height: calc(100vh - 77px) !important;
  overflow-y: auto;
}

.docker-icon {
  width: 26px;
  height: 18px;
}
</style>
