<template>
  <div class="log-wrap">
    <pre class="log">{{ loginfo ? loginfo : 'No log' }}</pre>
    <el-pagination
      v-if="app" v-model:current-page="curPage" v-model:page-size="pageSize" background class="log-pager"
      layout="prev, pager, next" :total="app.stdout_file_count || 0" @update:current-page="getAppLogByName"
    />
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
/* flat: log fills the top, pagination sits below — one container, one (log) scroll */
.log-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.log-pager {
  flex: 0 0 auto;
  margin-top: 8px;
  justify-content: center;
}

.log {
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  padding: 12px 14px;
  overflow: auto;
  box-sizing: border-box;
  background-color: var(--console-bg);
  color: var(--console-fg);
  font-size: 13px;
  line-height: 1.6;
  font-family: var(--mono-font);
  white-space: pre-wrap;
  word-break: break-word;
  border-radius: 6px;
}
</style>
