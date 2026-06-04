<template>
  <div class="log-wrap">
    <el-pagination
      v-if="app" v-model:current-page="curPage" v-model:page-size="pageSize" background class="log-pager"
      layout="prev, pager, next" :total="app.stdout_cache_size" @update:current-page="getAppLogByName"
    />
    <pre class="log">{{ loginfo ? loginfo : 'No log' }}</pre>
  </div>
</template>

<script>
import applications from "@/services/applications";
export default {
  name: "AppLog",
  props: { app: { type: Object, default: null }, loginfo: { type: String, default: null } },
  data() {
    return {
      curPage: 1,
      pageSize: 1,
    };
  },
  mounted() {
    this.curPage = 1;
  },
  methods: {
    initCurPage() {
      this.curPage = 1;
    },
    getAppLogByName(index) {
      applications.getAppLogForLogPage(this, this.app.name, index - 1, 0);
    },
  },
};
</script>

<style scoped>
/* flat: pagination on top, log fills below — one container, one (log) scroll */
.log-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.log-pager {
  flex: 0 0 auto;
  margin-bottom: 8px;
}

.log {
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  padding: 12px 14px;
  overflow: auto;
  box-sizing: border-box;
  background-color: #001528;
  color: #bfcbd9;
  font-size: 13px;
  line-height: 1.6;
  font-family: "Menlo", "Monaco", "Consolas", monospace;
  white-space: pre-wrap;
  word-break: break-word;
  border-radius: 6px;
}
</style>
