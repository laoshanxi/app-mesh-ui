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
  /* 50 = navbar (in normal flow when fixedHeader is off) */
  height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  /* scroll here instead of growing the page: a definite height lets flex pages
     (e.g. Applications) pin their table scrollbars to the bottom of the viewport */
  overflow-y: auto;
  overflow-x: hidden;
  /* flex column so pages can `flex: 1` to fill the content area */
  display: flex;
  flex-direction: column;
}
.fixed-header+.app-main {
  /* fixed navbar is out of flow: take the full viewport and clear the navbar with padding */
  padding-top: 50px;
  height: 100vh;
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
