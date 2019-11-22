<template>
  <el-card class="box-card">
    <pre class="log">{{loginfo ? loginfo : 'No log'}}</pre>
  </el-card>
</template>

<script>
export default {
  name:"AppLog",
  props:[
    "loginfo"
  ],
  mounted(){
  },
  methods:{
  }
}
</script>

<style>
.log {
  color: #606266;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif;
}
</style>
