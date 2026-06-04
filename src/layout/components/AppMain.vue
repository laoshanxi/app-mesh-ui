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
  /* flex column so pages can `flex: 1` to fill the content area without
     hardcoding any pixel height of their own. Tall block pages that don't
     opt in still grow naturally (min-height is a floor, not a cap). */
  display: flex;
  flex-direction: column;
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
