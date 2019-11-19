<template>
  <div class="description_text">
      <div v-if="title" class="title">{{title}}</div>
      <el-row :gutter="gutter">
        <slot></slot>
      </el-row>
  </div>
</template>

<script>

export default {
  name: "DescriptionList",
  props: {
  	title: "",
    gutter: {
      type: [Number, String],
      default: 20
    },
    col: {
      type: [Number, String],
      default: 8
    }
  },

  data() {
    return {
    };
  },
  watch: {
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
    line-height: 22px;
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
    line-height: 1.5;
    width: 100%;
    color: #909399;
    display: table-cell;
  }
}
</style>
