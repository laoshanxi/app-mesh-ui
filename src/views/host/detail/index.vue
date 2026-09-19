<template>
  <div v-if="record != 'No Data'" class="host-detail">
    <el-alert
      v-if="record.collector_errors && record.collector_errors.length"
      class="collector-errors" type="warning" :closable="false"
      :title="'Collector degraded: ' + record.collector_errors.join(', ')"
    />

    <section class="kv-section">
      <h3 class="kv-title">Host</h3>
      <div class="kv-grid">
        <div class="kv"><span class="k">Host name</span><span class="v">{{ formatEmpty(record.host_name) }}</span></div>
        <div class="kv"><span class="k">Date time</span><span class="v">{{ formatEmpty(record.systime) }}</span></div>
        <div class="kv"><span class="k">OS / Arch</span><span class="v">{{ formatEmpty(record.os) }} / {{ formatEmpty(record.architecture) }}</span></div>
        <div class="kv"><span class="k">In container</span><span class="v"><el-tag size="small" effect="light" :type="record.in_container ? 'warning' : 'info'">{{ record.in_container ? "Yes" : "No" }}</el-tag></span></div>
        <div class="kv"><span class="k">OS user</span><span class="v">{{ formatEmpty(record.os_user) }}</span></div>
        <div class="kv"><span class="k">App Mesh version</span><span class="v">{{ formatEmpty(record.appmesh_version) }}</span></div>
        <div class="kv"><span class="k">Daemon start time</span><span class="v">{{ formatEmpty(record.appmesh_start_time) }}</span></div>
        <div class="kv"><span class="k">Daemon PID</span><span class="v">{{ formatEmpty(record.pid) }}</span></div>
        <div class="kv"><span class="k">1 min load</span><span class="v">{{ formatEmpty(record.load["1min"]) }}</span></div>
        <div class="kv"><span class="k">5 min load</span><span class="v">{{ formatEmpty(record.load["5min"]) }}</span></div>
        <div class="kv"><span class="k">15 min load</span><span class="v">{{ formatEmpty(record.load["15min"]) }}</span></div>
      </div>
    </section>

    <section class="kv-section">
      <h3 class="kv-title">CPU &amp; Memory</h3>
      <div class="kv-grid">
        <div class="kv"><span class="k">Sockets</span><span class="v">{{ formatEmpty(record.cpu_sockets) }}</span></div>
        <div class="kv"><span class="k">Cores</span><span class="v">{{ formatEmpty(record.cpu_cores) }}</span></div>
        <div class="kv"><span class="k">Processors</span><span class="v">{{ formatEmpty(record.cpu_processors) }}</span></div>
        <div class="kv"><span class="k">Effective processors</span><span class="v">{{ formatEmpty(record.cpu_effective_processors) }}</span></div>
        <div class="kv"><span class="k">CPU quota cores</span><span class="v">{{ formatEmpty(record.cpu_quota_cores) }}</span></div>
        <div class="kv"><span class="k">CPU source</span><span class="v">{{ formatEmpty(record.cpu_source) }}</span></div>
        <div class="kv"><span class="k">Cgroup version</span><span class="v">{{ formatEmpty(record.cgroup_version) }}</span></div>
        <div class="kv"><span class="k">Memory source</span><span class="v">{{ formatEmpty(record.memory_source) }}</span></div>
        <div class="kv"><span class="k">Swap source</span><span class="v">{{ formatEmpty(record.swap_source) }}</span></div>
        <div class="kv"><span class="k">App Mesh memory</span><span class="v">{{ formatMemory(record.mem_applications) }}</span></div>
        <div class="kv"><span class="k">Daemon tree memory</span><span class="v">{{ formatMemory(record.mem_daemon_process_tree_bytes) }}</span></div>
        <div class="kv"><span class="k">Daemon tree fds</span><span class="v">{{ formatEmpty(record.fd) }}</span></div>
        <div class="kv"><span class="k">Daemon fds</span><span class="v">{{ formatEmpty(record.fd_daemon) }}</span></div>
      </div>

      <div class="meter">
        <div class="meter-row">
          <span class="meter-name">Memory</span>
          <el-progress
            class="meter-bar" :text-inside="true" :stroke-width="22"
            :percentage="memPercent(record.mem_total_bytes, record.mem_available_bytes)" status="exception"
          />
          <span class="meter-note">available {{ formatMemory(record.mem_available_bytes) }} / total {{ formatMemory(record.mem_total_bytes) }}</span>
        </div>
        <div class="meter-row">
          <span class="meter-name">Swap</span>
          <el-progress
            class="meter-bar" :text-inside="true" :stroke-width="22"
            :percentage="memPercent(record.mem_swap_total_bytes, record.mem_swap_free_bytes)" status="exception"
          />
          <span class="meter-note">free {{ formatMemory(record.mem_swap_free_bytes) }} / total {{ formatMemory(record.mem_swap_total_bytes) }}</span>
        </div>
      </div>
    </section>

    <section class="kv-section">
      <h3 class="kv-title">Disk</h3>
      <el-table
        :key="1" :data="record.fs" border size="small" :default-sort="{ prop: 'size' }" style="width: 100%"
        highlight-current-row
      >
        <el-table-column label="Device" prop="device">
          <template #default="scope">
            <el-icon v-if="formatPercent(scope.row.usage)" style="color: firebrick; font-size: 16px; vertical-align: middle"><WarningFilled /></el-icon>
            {{ formatEmpty(scope.row.device) }}
          </template>
        </el-table-column>
        <el-table-column label="Size" width="120">
          <template #default="scope">{{ formatMemory(scope.row.size) }}</template>
        </el-table-column>
        <el-table-column label="Used" width="120">
          <template #default="scope">{{ formatMemory(scope.row.used) }}</template>
        </el-table-column>
        <el-table-column label="Available" width="120">
          <template #default="scope">{{ formatMemory(scope.row.available) }}</template>
        </el-table-column>
        <el-table-column label="Usage" width="200">
          <template #default="scope">
            <el-progress
              :text-inside="true" :stroke-width="20"
              :percentage="fsPercent(scope.row.usage)" status="exception"
            />
          </template>
        </el-table-column>
        <el-table-column label="Mount point">
          <template #default="scope">{{ formatEmpty(scope.row.mount_point) }}</template>
        </el-table-column>
      </el-table>
    </section>

    <section class="kv-section">
      <h3 class="kv-title">Network</h3>
      <el-table
        :key="2" :data="record.net" size="small" :default-sort="{ prop: 'name' }" border style="width: 100%"
        highlight-current-row
      >
        <el-table-column label="Name" width="240" prop="name">
          <template #default="scope">{{ formatEmpty(scope.row.name) }}</template>
        </el-table-column>
        <el-table-column label="Protocol" width="100" prop="protocol">
          <template #default="scope">
            <el-tag size="small" :type="scope.row.ipv6 ? 'success' : 'info'">{{ scope.row.ipv6 ? "IPv6" : "IPv4" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Address" prop="address">
          <template #default="scope">{{ formatEmpty(scope.row.address) }}</template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script>
import { formatEmpty, formatMemory } from "@/utils";
import { WarningFilled } from "@element-plus/icons-vue";

export default {
  name: "Detail",
  components: { WarningFilled },
  props: { record: { type: [Object, String], default: null } },
  methods: {
    formatEmpty,
    formatMemory,
    formatPercent(data) {
      return data > 0.85;
    },
    // clamp fs usage (0..1) to a valid ElProgress percentage
    fsPercent(usage) {
      const pct = Number(usage) * 100;
      return Number.isFinite(pct) ? Math.min(100, Math.max(0, parseFloat(pct.toFixed(2)))) : 0;
    },
    // daemon field names: mem_total_bytes/mem_available_bytes/mem_swap_* (ResourceCollection.cpp)
    memPercent(total, free) {
      if (!total || total <= 0 || free == null) return 0;
      const pct = parseFloat((((total - free) / total) * 100).toFixed(2));
      return Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : 0;
    },
  },
};
</script>

<style lang="scss" scoped>
.host-detail {
  padding: 4px 4px 16px;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
}

/* schema v3 degradation hints (ResourceCollection collector_errors) */
.collector-errors {
  margin-bottom: 14px;
}

.kv-section + .kv-section {
  margin-top: 18px;
}

.kv-title {
  margin: 0 0 10px;
  padding-left: 9px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  color: #303133;
  border-left: 3px solid #409eff;
}

.kv-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 28px;
}

.kv {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
  padding: 6px 0;
  border-bottom: 1px dashed #ebeef5;
  font-size: 13px;
  line-height: 1.5;

  &--full {
    grid-column: 1 / -1;
  }
}

.k {
  flex: 0 0 auto;
  width: 150px;
  color: #909399;
  white-space: nowrap;
}

.v {
  flex: 1 1 auto;
  min-width: 0;
  color: #303133;
  word-break: break-all;
}

/* memory / swap meters */
.meter {
  margin-top: 12px;
}

.meter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}

.meter-name {
  flex: 0 0 auto;
  width: 60px;
  font-size: 13px;
  color: #909399;
}

.meter-bar {
  flex: 0 0 320px;
}

.meter-note {
  flex: 1 1 auto;
  font-size: 12px;
  color: #909399;
}
</style>
