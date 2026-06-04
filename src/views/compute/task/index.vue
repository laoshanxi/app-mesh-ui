<template>
  <el-card class="console-card">
    <template #header>
      <div class="toolbar">
        <el-select v-model="selectedApp" filterable placeholder="Task-capable app" :loading="appsLoading" class="app-select">
          <el-option v-for="a in apps" :key="a.name" :label="a.name" :value="a.name" />
        </el-select>
        <el-tag v-if="taskStatus" :type="taskStatus === 'idle' ? 'success' : 'warning'">{{ taskStatus }}</el-tag>
        <span class="t-label">Timeout</span>
        <el-input-number v-model="timeout" :min="1" :max="3600" :step="10" controls-position="right" class="t-num" />
        <span class="spacer" />
        <el-button type="primary" :loading="sending" :disabled="!selectedApp" @click="send">Send Task</el-button>
        <el-button :disabled="!selectedApp" @click="cancel">Cancel</el-button>
      </div>
    </template>
    <div class="console-body">
      <div class="pane">
        <div class="pane-title">Payload</div>
        <textarea v-model="payload" class="dark-area" placeholder="e.g. print(1+2)"></textarea>
        <div v-if="history.length" class="history">
          <el-tag
            v-for="(h, i) in history" :key="i" size="small" style="margin: 0 6px 6px 0; cursor: pointer"
            @click="payload = h"
          >{{ h }}</el-tag>
        </div>
      </div>
      <div class="pane">
        <div class="pane-title">Result</div>
        <json-viewer v-if="resultIsJson" :value="result" boxed />
        <pre v-else class="dark-area">{{ result }}</pre>
      </div>
    </div>
  </el-card>
</template>

<script>
import taskService from "@/services/task";

export default {
  name: "RunTask",
  data() {
    return {
      apps: [],
      appsLoading: false,
      selectedApp: "",
      timeout: 300,
      payload: "",
      history: [],
      result: "",
      resultIsJson: false,
      sending: false,
      poller: null,
    };
  },
  computed: {
    taskStatus() {
      return taskService.status(this);
    },
  },
  mounted() {
    taskService.getTaskApps(this);
    this.poller = setInterval(() => taskService.getTaskApps(this), 3000);
  },
  unmounted() {
    if (this.poller) clearInterval(this.poller);
  },
  methods: {
    send() {
      taskService.sendTask(this);
    },
    cancel() {
      taskService.cancel(this);
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
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  gap: 10px;
  width: 100%;
  background-color: #001528;
  color: #bfcbd9;
  padding: 10px;
  box-sizing: border-box;
}

.pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.pane-title {
  color: #909399;
  margin-bottom: 6px;
}

.dark-area {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  background-color: #001528;
  color: #bfcbd9;
  border: 1px solid #1b2948;
  border-radius: 4px;
  padding: 8px;
  margin: 0;
  font-family: Consolas, Menlo, Courier, monospace;
  font-size: 14px;
  resize: none;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: auto;
}

.history {
  margin-top: 6px;
}
</style>
