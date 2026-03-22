<template>
  <div v-if="record != 'No Data'" class="box-card">
    <DescriptionList title="Host" col="8">
      <Description term="Host name">{{ formatEmpty(record.host_name) }}</Description>
      <Description term="Date time">{{ formatEmpty(record.systime) }}</Description>
      <Description term="Description">{{ formatEmpty(record.host_description) }}</Description>
    </DescriptionList>
    <DescriptionList title col="8">
      <Description term="1 minutes Load">{{ formatEmpty(record.load["1min"]) }}</Description>
      <Description term="5 minutes Load">{{ formatEmpty(record.load["5min"]) }}</Description>
      <Description term="15 minutes Load">{{ formatEmpty(record.load["15min"]) }}</Description>
    </DescriptionList>
    <el-divider></el-divider>
    <DescriptionList title="CPU & Memory" col="8">
      <Description term="Sockets">{{ formatEmpty(record.cpu_sockets) }}</Description>
      <Description term="Cores">{{ formatEmpty(record.cpu_cores) }}</Description>
      <Description term="Processors">{{ formatEmpty(record.cpu_processors) }}</Description>
    </DescriptionList>
    <DescriptionList title col="24">
      <Description term="Memory">
        <div style="margin-left: 39px;">
          <div class="chart-label-left">free {{ formatMemory(record.mem_free_bytes) }}</div>
          <div class="chart-div">
            <el-progress
              :text-inside="true" :stroke-width="25"
              :percentage="parseFloat(((record.mem_total_bytes - record.mem_free_bytes) / record.mem_total_bytes * 100).toFixed(2))"
              status="exception"
            ></el-progress>
          </div>
          <div class="chart-label">total {{ formatMemory(record.mem_total_bytes) }}</div>
        </div>
      </Description>
      <Description term="Swap memory">
        <el-row>
          <div class="chart-label-left">free {{ formatMemory(record.mem_freeSwap_bytes) }}</div>
          <div class="chart-div">
            <el-progress
              :text-inside="true" :stroke-width="25"
              :percentage="record.mem_totalSwap_bytes <= 0 ? 0 : parseFloat(((record.mem_totalSwap_bytes - record.mem_freeSwap_bytes) / record.mem_totalSwap_bytes * 100).toFixed(2))"
              status="exception"
            ></el-progress>
          </div>
          <div class="chart-label">total {{ formatMemory(record.mem_totalSwap_bytes) }}</div>
        </el-row>
      </Description>
      <Description term="App Mesh memory">{{ formatMemory(record.mem_applications) }}</Description>
    </DescriptionList>
    <el-divider></el-divider>

    <DescriptionList title="Disk" col="24" style="margin-bottom: 20px;">
      <el-table
        :key="1" :data="record.fs" border :default-sort="{ prop: 'size' }" style="width: 100%"
        highlight-current-row
      >
        <el-table-column label="Device" prop="device">
          <template #default="scope">
            <el-icon v-if="formatPercent(scope.row.usage)" style="color: firebrick;font-size: 18px; vertical-align: middle;"><WarningFilled /></el-icon>
            {{ formatEmpty(scope.row.device) }}
          </template>
        </el-table-column>
        <el-table-column label="Size" width="140">
          <template #default="scope">{{ formatMemory(scope.row.size) }}</template>
        </el-table-column>
        <el-table-column label="Used" width="140">
          <template #default="scope">{{ formatMemory(scope.row.used) }}</template>
        </el-table-column>
        <el-table-column label="Usage" width="200">
          <template #default="scope">
            <el-progress
              :text-inside="true" :stroke-width="25"
              :percentage="parseFloat((scope.row.usage * 100).toFixed(2))" status="exception"
            ></el-progress>
          </template>
        </el-table-column>
        <el-table-column label="Mount point">
          <template #default="scope">{{ formatEmpty(scope.row.mount_point) }}</template>
        </el-table-column>
      </el-table>
    </DescriptionList>
    <DescriptionList title="Network" col="24">
      <el-table
        :key="2" :data="record.net" :default-sort="{ prop: 'name' }" border style="width: 100%"
        highlight-current-row
      >
        <el-table-column label="Name" width="240" prop="name">
          <template #default="scope">{{ formatEmpty(scope.row.name) }}</template>
        </el-table-column>

        <el-table-column label="Protocol" width="100" prop="protocol">
          <template #default="scope">
            <el-tag v-if="scope.row.ipv6" :type="'success'">IPv6</el-tag>
            <el-tag v-else :type="'info'">IPv4</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Address" prop="address">
          <template #default="scope">{{ formatEmpty(scope.row.address) }}</template>
        </el-table-column>
      </el-table>
    </DescriptionList>
  </div>
</template>

<script>
import DescriptionList from "@/components/Descriptions/index.vue";
import Description from "@/components/Description/index.vue";
import { formatEmpty, formatMemory } from "@/utils";
import { WarningFilled } from "@element-plus/icons-vue";

export default {
  name: "Detail",
  components: {
    DescriptionList,
    Description,
    WarningFilled,
  },
  props: { record: { type: [Object, String], default: null } },
  data() {
    return {
      data: [
        {
          term: "Name",
          detail: "app",
        },
      ],
    };
  },
  mounted() { },
  methods: {
    formatEmpty,
    formatMemory,
    createChart(p) {
      console.info(p);
    },
    formatPercent(data) {
      return data > 0.85;
    },
    formatSwapMemUsageData() {
      let data = this.record;
      return [
        {
          key: "Usage",
          label: "Used",
          value: data.mem_totalSwap_bytes - data.mem_freeSwap_bytes,
        },
        {
          key: "Usage",
          label: "Free",
          value: data.mem_freeSwap_bytes,
        },
      ];
    },
    formatMemUsageData() {
      let data = this.record;
      return [
        {
          key: "Usage",
          label: "Used",
          value: data.mem_total_bytes - data.mem_free_bytes,
        },
        {
          key: "Usage",
          label: "Free",
          value: data.mem_free_bytes,
        },
      ];
    },
    formatUsageData(data) {
      return [
        {
          key: "Usage",
          label: "Used",
          value: data.used,
        },
        {
          key: "Usage",
          label: "Unused",
          value: data.size - data.used,
        },
      ];
    },
  },
};
</script>

<style>
.detail {
  vertical-align: middle;
}

.detail>div>div {
  height: 30px;
}

.chart-div {
  display: inline-block;
  width: 300px;
}

.chart-label {
  display: inline-block;
  position: relative;
}

.chart-label-left {
  display: inline-block;
  position: relative;
  text-align: right;
  width: 100px;
}

/* .el-progress-bar__outer{
  background-color: #67c23a;
  border-radius: 2px;
}
.el-progress-bar__inner{
  border-radius: 2px;
} */
</style>
