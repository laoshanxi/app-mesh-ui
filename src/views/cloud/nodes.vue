<template>
  <div class="app-container">
    <el-row style="color: #909399">
      <h4>
        Leader:
        <el-tag :type="'success'">{{ leader }}</el-tag>
      </h4>
    </el-row>
    <el-row>
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="hostName" label="Host" width="300">
          <template slot-scope="scope">
            <el-link
              :underline="true"
              @click="switchHost(scope.row.appmeshUrl)"
              title="Switch Host"
              >{{ scope.row.hostName }}</el-link
            >
          </template>
        </el-table-column>
        <el-table-column prop="freeMem" label="Free memory">
          <template slot-scope="scope">{{
            scope.row.freeMem | formatMemory
          }}</template>
        </el-table-column>
        <el-table-column prop="totalMem" label="Total memory">
          <template slot-scope="scope">{{
            scope.row.totalMem | formatMemory
          }}</template>
        </el-table-column>
        <el-table-column label="Memory usage" width="200">
          <template slot-scope="scope">
            <el-progress
              :text-inside="true"
              :stroke-width="25"
              :percentage="parseFloat((scope.row.usage * 100).toFixed(2))"
              status="exception"
              stroke-linecap="square"
            />
          </template>
        </el-table-column>
        <el-table-column prop="cpuCores" label="Cpu cores">
          <template slot-scope="scope">{{ scope.row.cpuCores }}</template>
        </el-table-column>
        <el-table-column label="Refresh time" prop="update" width="200">
          <template slot-scope="scope">{{
            scope.row.update | parseTime
          }}</template>
        </el-table-column>
      </el-table>
    </el-row>
  </div>
</template>
<script>
import { getNodes } from "@/api/cloud";
import mixin from "./mixin";
import EventBus from "@/utils/event.bus.js";
import { EVENTS } from "@/utils/constants.js";

export default {
  name: "Nodes",
  mixins: [mixin],
  data() {
    return {
      queryData: null,
      tableData: [],
      leader: "",
    };
  },
  methods: {
    switchHost(host) {
      EventBus.$emit(EVENTS.SWITCH_HOST, `${host}`);
    },
    fetchData() {
      getNodes({ recurse: true }).then((res) => {
        const { data } = res;
        console.info(data);
        this.tableData = this.formatData(data);
      });
    },
    formatData(data) {
      if (!data) return [];
      return Object.values(data).map((e, index) => {
        const {
          resource: {
            cpu_cores: cpuCores,
            mem_free_bytes: freeMem,
            mem_total_bytes: totalMem,
          },
          label: {
            HOST_NAME: hostFullName,
          },
          leader: leader,
          appmesh: appmeshUrl,
        } = e;
        const usage = (totalMem - freeMem ? freeMem : totalMem) / totalMem;
        const update = new Date();
        const hostName = this.formatName(hostFullName);
        if(leader){
          this.leader = hostName;
        }
        return {
          hostName,
          cpuCores,
          freeMem,
          totalMem,
          usage,
          update,
          appmeshUrl,
        };
      });
    },
  },
};
</script>
