<template>
  <div v-if="record" class="app-detail">
    <section v-for="sec in sections" :key="sec.title" class="kv-section">
      <h3 class="kv-title">{{ sec.title }}</h3>
      <div class="kv-grid">
        <div v-for="it in sec.items" :key="it.k" class="kv" :class="{ 'kv--full': it.full }">
          <span class="k">{{ it.k }}</span>
          <span class="v">
            <el-tag v-if="it.tag" size="small" :type="it.tag.type" effect="light">{{ it.tag.label }}</el-tag>
            <template v-else-if="'bool' in it">
              <el-tag size="small" effect="light" :type="it.bool ? 'success' : 'info'">{{ it.bool ? "Yes" : "No" }}</el-tag>
            </template>
            <span v-else :class="{ mono: it.mono, empty: isEmpty(it.v) }">{{ display(it.v) }}</span>
          </span>
        </div>
      </div>
    </section>

    <section v-if="record.metadata" class="kv-section">
      <h3 class="kv-title">Metadata</h3>
      <json-viewer :value="record.metadata" :expand-depth="2" class="meta-json" />
    </section>

    <section v-if="record.env && Object.keys(record.env).length" class="kv-section">
      <h3 class="kv-title">Environment variables</h3>
      <div class="kv-grid kv-grid--one">
        <div v-for="(value, name) in record.env" :key="name" class="kv kv--full">
          <span class="k mono">{{ name }}</span>
          <span class="v mono" :class="{ empty: isEmpty(value) }">{{ display(value) }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { formatEmpty, formatMemory, formatCpu } from "@/utils";

export default {
  name: "AppDetail",
  props: { record: { type: Object, default: null } },
  computed: {
    sections() {
      const r = this.record;
      if (!r) return [];
      const dl = r.daily_limitation
        ? `${r.daily_limitation.daily_start_TEXT} - ${r.daily_limitation.daily_end_TEXT}`
        : null;
      const rl = r.resource_limit || {};
      return [
        {
          title: "Basic information",
          items: [
            { k: "Name", v: r.name },
            { k: "Add time", v: r.register_time_TEXT },
            { k: "Owner", v: r.owner },
            { k: "Command", v: r.command, mono: true },
            { k: "Permission", v: r.permission },
            { k: "Status", tag: r.status === 1 ? { type: "success", label: "Enabled" } : { type: "info", label: "Disabled" } },
            { k: "Working dir", v: r.working_dir, mono: true },
            { k: "Shell mode", bool: !!r.shell },
            { k: "Session login", bool: !!r.session_login },
            { k: "Healthcheck cmd", v: r.health_check_cmd, mono: true },
            { k: "Start time", v: r.start_time_TEXT },
            { k: "End time", v: r.end_time_TEXT },
            { k: "Period run interval(S)", v: r.start_interval_seconds },
            { k: "Period run retention(S)", v: r.retention },
            { k: "Exit behavior", v: r.behavior && r.behavior.exit },
            { k: "Docker image", v: r.docker_image },
            { k: "Stdout cache definition", v: r.stdout_cache_num },
            { k: "Description", v: r.description, full: true },
          ],
        },
        {
          title: "Runtime information",
          items: [
            { k: "PID", v: r.pid },
            { k: "PID user", v: r.pid_user },
            { k: "Health", v: r.health },
            { k: "Memory", v: formatMemory(r.memory) },
            { k: "CPU usage", v: formatCpu(r.cpu) },
            { k: "Next start time", v: r.next_start_time_TEXT },
            { k: "Last start time", v: r.last_start_time ? r.last_start_time_TEXT : null },
            { k: "Return", v: r.return_code },
            { k: "Last exit time", v: r.last_exit_time ? r.last_exit_time_TEXT : null },
            { k: "Start number", v: r.starts },
            { k: "File descriptors", v: r.fd },
            { k: "Container id", v: r.container_id, mono: true },
            { k: "Last error", v: r.last_error, full: true, mono: true },
          ],
        },
        {
          title: "Extra information",
          items: [
            { k: "Daily limitation", v: dl },
            { k: "Physical memory (Mi)", v: rl.memory_mb },
            { k: "Virtual memory (Mi)", v: rl.memory_virt_mb },
            { k: "CPU shares", v: rl.cpu_shares },
            { k: "Stdout number", v: r.stdout_cache_size },
          ],
        },
      ];
    },
  },
  methods: {
    formatEmpty,
    isEmpty(v) {
      return v === null || v === undefined || v === "" || v === "-";
    },
    display(v) {
      return this.isEmpty(v) ? "–" : v;
    },
  },
};
</script>

<style lang="scss" scoped>
.app-detail {
  padding: 4px 4px 16px;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
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
  row-gap: 0;

  &--one {
    grid-template-columns: minmax(0, 1fr);
  }
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

  &.mono {
    font-family: "Menlo", "Monaco", "Consolas", monospace;
    font-size: 12px;
  }

  &.empty {
    color: #c0c4cc;
  }
}

.meta-json {
  font-size: 12px;
  border-radius: 6px;
  background-color: #fafafa;
  padding: 8px 10px;
}
</style>
