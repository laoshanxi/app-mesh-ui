<template>
  <el-card class="box-card">
    <el-pagination
      background
      @current-change="getAppLogByName"
      layout="prev, pager, next"
      :current-page.sync="curPage"
      :page-size="1"
      :total="app.stdout_cache_size"
    ></el-pagination>
    <pre class="log">{{loginfo ? loginfo : 'No log'}}</pre>
  </el-card>
</template>

<script>
import applications from "@/services/applications";
export default {
  name: "AppLog",
  data() {
    return {
      curPage: 1,
    };
  },
  props: ["app", "loginfo"],
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

<style>
.log {
  color: #606266;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB,
    Microsoft YaHei, Arial, sans-serif;
}
.box-card .el-card__body {
  height: calc(100vh - 80px) !important;
  overflow: auto;
}
</style>
