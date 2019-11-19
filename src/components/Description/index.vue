<template>
    <el-col :span="+col">
      <div class="term">{{term}}</div>
      <div class="detail">
        <slot></slot>
      </div>
    </el-col>
</template>

<script>

export default {
  name: "Description",
  props: {
  	title: "",
    term: ""
  },
  computed:{
    col(){
      return this.$parent.$parent.col;
    }
  }
};
</script>

<style lang="scss" scoped>
.description_text {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  .title {
    font-weight: 700;
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 20px;
    color: #303133;
  }
  .term {
    color: #606266;
    font-weight: 400;
    font-size: 14px;
    line-height: 35px;
    margin-right: 8px;
    white-space: nowrap;
    display: table-cell;
    &:after {
      content: ":";
      margin: 0 8px 0 2px;
      position: relative;
      top: -0.5px;
    }
  }
  .detail {
    font-size: 14px;
    line-height: 35px;
    width: 100%;
    color: #909399;
    display: table-cell;
  }
}
</style>
