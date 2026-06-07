<template>
  <div v-loading="loading" class="app-container" style="clear:both;">
    <el-row>
      <el-col :span="24">
        <el-tabs type="border-card">
          <el-tab-pane>
            <template #label>
              <span>
                <i class="iconfont icon-Prometheus"></i> Prometheus
              </span>
            </template>
            <pre class="log">{{ content }}</pre>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import configServices from "@/services/config.js";
export default {
  name: "Prometheus",
  data() {
    return {
      content: "",
      loading: true,
    };
  },
  mounted() {
    configServices.getPrometheus(this);
  },
};
</script>

<style lang="scss" scoped>
.log {
  color: #606266;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB,
    Microsoft YaHei, Arial, sans-serif;
}

/* Pixel-free fill: cascade flex from the flex-column app-main so the tab
   card fills the content area (no bottom gap) and the metrics text scrolls
   inside it — replaces the global forced 100vh-174px tab-content height. */
.app-container {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.app-container > .el-row {
  flex: 1 1 auto;
  min-height: 0;
  margin-bottom: 0;
}

.app-container > .el-row > .el-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

:deep(.el-tabs) {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

:deep(.el-tabs__content) {
  flex: 1 1 auto;
  min-height: 0;
  height: auto !important;
  overflow: auto;
}
</style>
