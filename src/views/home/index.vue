<template>
  <div class="dashboard-container">
    <div class="markdown-body" v-html="html"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";
import showdown from "showdown";
import readme from "html-loader!markdown-loader?modules!@/README.md";

export default {
  name: "Home",
  data() {
    return {
      rd: readme,
      html: "",
    };
  },
  computed: {
    ...mapGetters(["name"]),
  },
  components: {
    showdown,
  },
  mounted() {
    let converter = new showdown.Converter();
    let text = this.rd.toString();
    this.html = converter.makeHtml(text);
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
