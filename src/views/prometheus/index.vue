<template>
  <div v-loading="loading" class="app-container">
    <div class="page-title">Prometheus</div>
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

/* Pixel-free fill: cascade flex from app-main; metrics text scrolls inside. */
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
  /* Same reason as principals.vue: el-row is a wrapping row-flex container, so a
     child resolves its height against the content and the inner scroller never
     engages. Block layout keeps the percentage chain intact. */
  display: block;
}

.app-container > .el-row > .el-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
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
