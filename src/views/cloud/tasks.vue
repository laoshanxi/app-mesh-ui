<template>
  <div class="app-container">
    <el-row style="margin-bottom: 8px">
      <el-button-group>
        <el-button @click="drawer = true" type="primary" icon="el-icon-plus"
          >Add</el-button
        >
      </el-button-group>
    </el-row>
    <!-- add drawer -->
    <el-drawer title="Add Task" :visible.sync="drawer">
      <div shadow="never" class="add-task-card">
        <el-row style="margin-bottom: 8px">
          <el-input type="textarea" v-model="jsonStr"></el-input>
        </el-row>
        <div class="btn-group">
          <el-button type="primary" @click="addTask">Add</el-button>
          <el-button @click="drawer = false">Cancel</el-button>
        </div>
      </div>
    </el-drawer>
    <el-row>
      <el-table :data="tableData" style="width: 100%" border v-loading="dataOk">
        <el-table-column prop="name" label="Name">
          <template slot-scope="scope">{{ scope.row.name }}</template>
        </el-table-column>
        <el-table-column prop="replication" label="Replication" width="100" />
        <el-table-column prop="memoryMB" label="memoryMB" width="100" />
        <el-table-column
          prop="scheduleNumber"
          label="Schedule Number"
          width="150"
        >
          <template slot-scope="scope">
            <el-tag
              hit
              v-if="scope.row.scheduleNumber == scope.row.replication"
              :type="'success'"
              >{{ scope.row.scheduleNumber }}</el-tag
            >
            <el-tag hit v-else :type="'warning'">{{
              scope.row.scheduleNumber
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="scheduleHosts"
          label="Schedule Hosts"
          width="150"
        >
          <template slot-scope="scope">
            <pre>{{ scope.row.scheduleHosts }}</pre>
          </template>
        </el-table-column>
        <el-table-column prop="port" label="Port" width="80" />
        <el-table-column prop="content" label="Application" width="340">
          <template slot-scope="scope">
            <pre>{{ scope.row.content }}</pre>
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="Condition" width="280">
          <template slot-scope="scope">
            <pre>{{ scope.row.condition }}</pre>
          </template>
        </el-table-column>
        <el-table-column label="Action" width="120">
          <template slot-scope="scope">
            <el-button
              type="text"
              icon="el-icon-delete"
              @click="removeTask(scope.row)"
              >Remove</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-row>
  </div>
</template>
<script>
import mixin from "./mixin";
import defaultTask from "./task.json";
import { getTask, deleteTask, addTask } from "@/api/cloud";
export default {
  name: "Task",
  mixins: [mixin],
  data() {
    return {
      tableData: [],
      dataOk: false,
      drawer: false,
      jsonStr: JSON.stringify(defaultTask, null, 4),
    };
  },
  methods: {
    fetchData() {
      getTask()
        .then((res) => {
          let _tableData = this.formatData(res.data);
          this.tableData = _tableData;
        })
        .catch((res) => {
          console.info(res);
        });
    },
    formatData(data) {
      if (!data) return [];
      return Object.values(data).map((e, index) => {
        e.name = this.formatName(e.content.name);
        e.content = JSON.stringify(e.content, null, 4);
        e.condition = JSON.stringify(e.condition, null, 4);
        e["scheduleNumber"] = e.status ? Object.keys(e.status).length : 0;
        e["scheduleHosts"] = e.status ? Object.keys(e.status) : [];
        return e;
      });
    },
    removeTask(row) {
      this.$confirm(
        `Do you want to remove the task <${row.name}> ?`,
        "Tooltip",
        {
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      ).then(async () => {
        const { data } = await deleteTask(row.name);
        if (data) {
          const index = this.tableData.findIndex((e) => e.name === row.name);
          this.tableData.splice(index, 1);
        }
      });
    },
    addTask() {
      const { jsonStr } = this;
      const {
        content: { name },
      } = JSON.parse(jsonStr);
      addTask(jsonStr, name).then((res) => {
        if (res.data) {
          this.drawer = false;
          this.$message({
            type: "success",
            message: "add task successful",
          });
          this.fetchData();
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.add-task-card {
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  & > div:nth-child(1) /deep/ {
    flex: 1;
    display: flex;
    flex-direction: row;
    .el-textarea {
      height: 100%;
      flex: 1;
      max-width: 1000px !important;
      > textarea {
        height: 100%;
        width: 100%;
        max-width: 1000px !important;
      }
    }
  }
  .btn-group {
    text-align: right;
  }
}
pre {
  font-size: 14px;
  color: #606266;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB,
    Microsoft YaHei, Arial, sans-serif;
}
</style>
