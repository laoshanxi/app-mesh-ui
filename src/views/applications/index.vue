<template>
  <div class="app-container">
    <el-row style="color: #909399">
      <h4>Applications</h4>
    </el-row>
    <el-row>
      <el-button-group>
        <el-button type="primary" :icon="Plus" @click="btnClick('register')">
          Add
        </el-button>
        <el-button type="success" :icon="Edit" :disabled="!isSelected" @click="btnClick('update')">
          Edit
        </el-button>
        <el-button type="danger" :icon="Delete" :disabled="!isSelected" @click="btnClick('delete')">
          Delete
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button type="success" :icon="Open" :disabled="!isSelected || isEnabled" @click="btnClick('enable')">
          Enable
        </el-button>
        <el-button
          type="warning" :icon="TurnOff" :disabled="!isSelected || !isEnabled"
          @click="btnClick('disable')"
        >
          Disable
        </el-button>
      </el-button-group>
    </el-row>
    <el-row>
      <el-table
        ref="appTable" :key="tableKey" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        style="width: 100%" height="100%" class="fix-table" :fit="true" highlight-current-row
        @current-change="currentRowChange"
      >
        <el-table-column label="Name" width="200">
          <template #default="scope">
            <el-icon
              v-if="scope.row.health == 0"
              style="color: #85ce61; font-size: 18px; vertical-align: middle"
            >
              <SuccessFilled />
            </el-icon>
            <el-icon v-else style="color: #f56c6c; font-size: 18px; vertical-align: middle"><WarningFilled /></el-icon>

            <el-link underline="always" :title="scope.row.desc" @click="showDetail()">
              {{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="Owner" width="100">
          <template #default="scope">
            {{ formatEmpty(scope.row.owner) }}
          </template>
        </el-table-column>
        <el-table-column class-name="status-col" label="State" width="90">
          <template #default="scope">
            <el-tag v-if="scope.row.status == 1" :type="'success'">
              Enabled
            </el-tag>
            <el-tag v-else :type="'info'">
              Disabled
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="PID" width="90">
          <template #default="scope">
            <span v-if="scope.row.pstree">
              <el-link underline="always" :title="scope.row.pstree">
                {{ formatEmpty(scope.row.pid) }}
              </el-link>
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="User" width="90">
          <template #default="scope">
            {{ formatEmpty(scope.row.pid_user) }}
          </template>
        </el-table-column>
        <el-table-column label="Memory" width="110">
          <template #default="scope">
            {{ formatMemory(scope.row.memory) }}
          </template>
        </el-table-column>
        <el-table-column label="%Cpu" width="110">
          <template #default="scope">
            {{ formatCpu(scope.row.cpu) }}
          </template>
        </el-table-column>
        <el-table-column label="Return" width="70">
          <template #default="scope">
            {{ formatEmpty(scope.row.return_code) }}
          </template>
        </el-table-column>
        <el-table-column label="Starts" width="70">
          <template #default="scope">
            {{ formatEmpty(scope.row.starts) }}
          </template>
        </el-table-column>
        <el-table-column label="Age" width="120">
          <template #default="scope">
            {{ formatEmpty(scope.row.age) }}
          </template>
        </el-table-column>
        <el-table-column label="Duration" width="120">
          <template #default="scope">
            {{ formatEmpty(scope.row.duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="last_start_time" label="Last Start Time" width="230">
          <template #default="scope">
            <span v-if="scope.row.last_start_time">
              <el-link underline="always" title="Show log" @click="showLog(scope.row)">
                <el-icon><Document /></el-icon>
                <el-icon style="margin-right: 5px"><Clock /></el-icon>
                {{ formatDate(scope.row.last_start_time) }}
              </el-link>
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="Command" show-overflow-tooltip>
          <template #default="scope">
            {{ formatEmpty(scope.row.command) }}
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <!-- Add application dialog -->
    <!-- <el-dialog title="Add Application" :visible.sync="registerFormVisible" fullscreen="false"> -->
    <el-drawer v-model="registerFormVisible" custom-class="right-drawer" size="60%">
      <template #header><span>{{ drawerTitle }}</span></template>
      <app-reg :prop-form="selectedForm" @close="registerFormVisible = false" @success="regSuccess()" />
    </el-drawer>

    <!-- show application detail -->
    <el-drawer v-model="isShowDetail" size="50%">
      <template #header>
        <span>
          <el-icon><ViewIcon /></el-icon>
          &nbsp;&nbsp;{{ currentRow ? currentRow.name : "Please select one application" }}
          <i v-if="currentRow && currentRow.docker_image" class="iconfont icon-docker" />
        </span>
      </template>
      <div v-loading="isLoadingDetail" class="detail-card">
        <app-detail :record="currentRow" />
      </div>
    </el-drawer>

    <!-- show application logs -->
    <el-drawer v-model="isShowLog" size="50%">
      <template #header>
        <span>
          <el-icon><Document /></el-icon>
          &nbsp;&nbsp;{{ currentRow ? currentRow.name : "Please select one application" }}
        </span>
      </template>
      <div v-loading="isLoadingLog" class="detail-card">
        <app-log
          ref="appLog" :loginfo="appLogInfo" :app="currentRow" @start-loading="isLoadingLog = true"
          @loading-done="logChange"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import applications from "@/services/applications";
import { formatEmpty, formatMemory, formatCpu, formatDate } from "@/utils";
import { markRaw } from 'vue'
import { Plus, Edit, Delete, Open, TurnOff, View as ViewIcon, Document, Clock, SuccessFilled, WarningFilled } from "@element-plus/icons-vue";
import AppDetail from "./appDetail/index.vue";
import AppLog from "./appLog/index.vue";
import AppReg from "./appReg/index.vue";

export default {
  components: {
    AppDetail,
    AppLog,
    AppReg,
    SuccessFilled, WarningFilled, ViewIcon, Document, Clock,
  },
  data() {
    return {
      Plus: markRaw(Plus), Edit: markRaw(Edit), Delete: markRaw(Delete), Open: markRaw(Open), TurnOff: markRaw(TurnOff),
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
    formatEmpty,
    formatMemory,
    formatCpu,
    formatDate,
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

    currentRowChange(currentRow, _oldCurrentRow) {
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
