<template>
  <div>
    <div v-text="html"></div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Home",
  data() {
    return {
      html: "Web GUI for App Mesh",
    };
  },
  computed: {
    ...mapGetters(["name"]),
  },
  mounted() {
    this.html = "Web GUI for App Mesh";
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
