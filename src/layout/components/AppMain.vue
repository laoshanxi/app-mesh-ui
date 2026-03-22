<template>
  <section class="app-main">
    <router-view :key="key" />
  </section>
</template>

<script>
import {mapGetters} from 'vuex'
export default {
  name: 'AppMain',
  computed: {
    key() {
      return this.$route.path
    },
    ...mapGetters([
      'loading'
    ])
  }
}
</script>

<style scoped>
.app-main {
  /*50 = navbar  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}
.fixed-header+.app-main {
  padding-top: 50px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
