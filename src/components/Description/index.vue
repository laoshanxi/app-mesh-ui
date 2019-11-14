<template>
  <div class="description_text">
      <div v-if="title" class="title">{{title}}</div>
      <el-row :gutter="gutter">
        <el-col :key="key" :span="+col" v-for="(item, key) in dataSource">
          <div class="term">{{item.term}}</div>
          <div class="detail">{{item.detail}}</div>
        </el-col>
      </el-row>
    </div>
</template>

<script>
const handleArrayObj = data => {
  return data
    .filter(item => item.tag === "Description")
    .map(item => ({
      tag: item.tag,
      term: (item.data && item.data.attrs.term) || "-",
      detail: (item.children && item.children[0].text) || "-"
    }));
};

export default {
  name: "Description",
  props: {
  	title: "",
  	content: [Object, Array],
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
      dataSource: handleArrayObj(this.$slots.default || [])
    };
  },
  watch: {
  	content() {
  		this.dataSource = handleArrayObj(this.$slots.default || [])
  	}
  }// 监听重渲染
};
</script>

<style lang="scss" scoped>
.description_text {
  font-family: "Hiragino Sans GB";
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
    padding-bottom: 16px;
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
    padding-bottom: 16px;
    color: #909399;
    display: table-cell;
  }
}
</style>
