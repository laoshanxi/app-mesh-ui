<template>

  <div class="app-container" style="clear:both;" v-loading="loading">
    <el-row >
      <el-col :span="24">
        <el-tabs type="border-card">
          <el-tab-pane>
            <span slot="label"><i class="iconfont icon-Prometheus"></i> Prometheus</span>
            <pre class="log">{{content}}</pre>
          </el-tab-pane>

        </el-tabs>


      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getPrometheus } from '@/api/config.js'
export default {
  name: 'Prometheus',
  data(){
    return {
      content : "",
      loading : true,
    }
  },
  mounted () {
    this.loading = true;
    getPrometheus().then((res)=>{
      this.loading = false;
      this.content = res.data;
    }, (res)=>{
      this.loading = false;
      this.$message.error('Get prometheus monitor failed. ' + res.data, 5000);
    });
  }
}
</script>

<style lang="scss" scoped>
.log {
  color: #606266;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif;
}
.box-card .el-card__body{
    height: calc(100vh - 80px) !important;
    overflow: auto;
}
</style>
