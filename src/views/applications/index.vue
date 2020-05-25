<template>
  <div class="app-container">
    <el-row style="color: #909399;">
      <h4>Applications</h4>
    </el-row>
    <el-row>
      <el-button-group>
        <el-button
          @click="btnClick('register')"
          type="primary"
          icon="el-icon-plus"
          >Add</el-button
        >
        <el-button
          @click="btnClick('update')"
          type="success"
          icon="el-icon-edit"
          :disabled="!isSelected"
          >Edit</el-button
        >
		<el-button
        @click="btnClick('delete')"
        type="danger"
        icon="el-icon-delete"
        :disabled="!isSelected"
        >Delete</el-button
      >
      </el-button-group>
      
      <el-button-group>
        <el-button
          @click="btnClick('enable')"
          type="success"
          icon="el-icon-open"
          :disabled="!isSelected || isEnabled"
          >Enable</el-button
        >
        <el-button
          @click="btnClick('disable')"
          type="warning"
          icon="el-icon-turn-off"
          :disabled="!isSelected || !isEnabled"
          >Disable</el-button
        >
      </el-button-group>
    </el-row>
    <el-row>
      <el-table
        :key="tableKey"
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        style="width: 100%"
        height="100%"
        class="fix-table"
        :fit="true"
        highlight-current-row
        @current-change="currentRowChange"
      >
        <el-table-column label="Name" width="200">
          <template slot-scope="scope">
            <el-link
              :underline="true"
              @click="showDetail()"
              title="Show application detail"
            >
              <i class="el-icon-view"></i>
              {{ scope.row.name }}
            </el-link>
            <i v-if="scope.row.docker_image" class="iconfont icon-docker" />
            <i v-if="scope.row.metadata == 'cloud-app'" class="el-icon-cloudy" />
			<i v-if="scope.row.metadata == 'system-internal'" class="el-icon-setting" />
          </template>
        </el-table-column>

        <el-table-column label="Health" width="70">
          <template slot-scope="scope">
            <i
              class="el-icon-success"
              style="color: #85ce61;font-size: 18px; vertical-align: middle;"
              v-if="scope.row.health == 0"
            ></i>
            <i
              class="el-icon-warning"
              style="color: #f56c6c;font-size: 18px; vertical-align: middle;"
              v-else
            ></i>
          </template>
        </el-table-column>
		<el-table-column label="Owner" width="100">
          <template slot-scope="scope">{{
            scope.row.owner | formatEmpty
          }}</template>
        </el-table-column>
        <el-table-column label="Exec user" width="100">
          <template slot-scope="scope">{{
            scope.row.exec_user | formatEmpty
          }}</template>
        </el-table-column>
        <el-table-column class-name="status-col" label="State" width="110">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status == 1" :type="'success'"
              >Enabled</el-tag
            >
            <el-tag v-else :type="'info'">Disabled</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="PID" width="100">
          <template slot-scope="scope">{{
            scope.row.pid | formatEmpty
          }}</template>
        </el-table-column>
        <el-table-column label="Memory" width="110">
          <template slot-scope="scope">{{
            scope.row.memory | formatMemory
          }}</template>
        </el-table-column>
        <el-table-column label="Return" width="110">
          <template slot-scope="scope">{{
            scope.row.return | formatEmpty
          }}</template>
        </el-table-column>
        <el-table-column
          prop="last_start_time"
          label="Last Start Time"
          width="200"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.last_start_time">
              <el-link :underline="true" @click="showLog()" title="Show log">
                <i class="el-icon-document"></i>
                <i class="el-icon-time" style="margin-right: 5px;" />
                {{
                  scope.row.last_start_time | parseTime("{y}-{m}-{d} {h}:{i}")
                }}
              </el-link>
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <af-table-column label="Command">
          <template slot-scope="scope">{{
            scope.row.command | formatEmpty
          }}</template>
        </af-table-column>
      </el-table>
    </el-row>

    <!-- Add application dialog -->
    <!-- <el-dialog title="Add Application" :visible.sync="registerFormVisible" fullscreen="false"> -->
    <el-drawer
      custom-class="right-drawer"
      title="Add Application"
      :visible.sync="registerFormVisible"
      size="60%"
    >
      <app-reg
        @close="registerFormVisible = false"
        @success="regSuccess()"
        :propForm="selectedForm"
      ></app-reg>
    </el-drawer>

    <!-- show application detail -->
    <el-drawer
      :visible.sync="isShowDetail"
      v-loading="isLoadingDetail"
      size="50%"
    >
      <span slot="title">
        <span class="el-icon-view">
          &nbsp;&nbsp;{{
            currentRow ? currentRow.name : "Please select one application"
          }}
          <i
            v-if="currentRow && currentRow.docker_image"
            class="iconfont icon-docker"
          />
        </span>
      </span>
      <div class="detail-card">
        <app-detail :record="currentRow" />
      </div>
    </el-drawer>

    <!-- show application logs -->
    <el-drawer :visible.sync="isShowLog" v-loading="isLoadingLog" size="50%">
      <span slot="title">
        <span class="el-icon-document"
          >&nbsp;&nbsp;{{
            currentRow ? currentRow.name : "Please select one application"
          }}</span
        >
      </span>
      <div class="detail-card">
        <app-log :loginfo="appLogInfo" />
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
    AppReg
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "gray",
        deleted: "danger"
      };
      return statusMap[status];
    }
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
      selectedForm: {}
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    regSuccess() {
      this.registerFormVisible = false;
      this.fetchData();
    },
    showDetail() {
      this.isShowDetail = true;
    },
    showLog() {
      this.isShowLog = true;
      setTimeout(() => {
        this.getAppLogByName(this.currentRow.name);
      }, 500);
    },

    btnClick(action) {
      switch (action) {
        case "register": {
          this.selectedForm = {};
          this.registerFormVisible = true;
          return;
        }
        case "update": {
          this.selectedForm = this.currentRow;
          this.registerFormVisible = true;
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
      applications.getAppLogByName(this, name);
    }
  }
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
