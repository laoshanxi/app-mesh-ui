<template>
  <el-card class="console-card">
    <template #header>
      <div class="toolbar">
        <el-select v-model="selectedApp" filterable placeholder="Select app" :loading="appsLoading" class="app-select">
          <el-option v-for="a in apps" :key="a.name" :label="a.name" :value="a.name" />
        </el-select>
        <el-switch v-model="isSync" active-text="Sync" inactive-text="Async" />
        <span class="t-label">Timeout</span>
        <el-input-number v-model="timeout" :min="5" :max="300" :step="5" controls-position="right" class="t-num" />
        <span class="spacer" />
        <el-button type="primary" :loading="running" :disabled="!selectedApp" @click="run">Run</el-button>
        <el-button :disabled="!output" @click="output = ''">Clear</el-button>
      </div>
    </template>
    <div ref="out" v-loading="running" class="console-body">
      <pre class="console-pre">{{ output }}</pre>
    </div>
  </el-card>
</template>

<script>
import runApp from "@/services/runApp";

export default {
  name: "RunApp",
  data() {
    return {
      apps: [],
      appsLoading: false,
      selectedApp: "",
      isSync: false,
      timeout: 60,
      running: false,
      output: "",
    };
  },
  mounted() {
    runApp.getRegisteredApps(this);
  },
  methods: {
    run() {
      runApp.runByName(this);
    },
  },
};
</script>

<style scoped>
/* follow Shell: dark, full-height body flush to card edges */
.console-card {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.console-card :deep(.el-card__body) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.console-card :deep(.el-card__header) {
  padding: 10px 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar .app-select {
  width: 200px;
}

.toolbar .t-num {
  width: 120px;
}

.t-label {
  color: #909399;
}

.spacer {
  flex: 1;
}

.console-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  width: 100%;
  background-color: #001528;
  color: #bfcbd9;
  padding: 10px;
}

.console-pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: Consolas, Menlo, Courier, monospace;
}
</style>
