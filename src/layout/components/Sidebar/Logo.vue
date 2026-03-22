<template>
  <div class="sidebar-logo-container" :class="{ collapse: collapse }">
    <router-link class="sidebar-logo-link" to="/">
      <img src="@/icons/svg/logo.svg" class="sidebar-logo" />
      <span v-show="!collapse" class="sidebar-title">{{ title }}</span>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    title() {
      return this.$store.state.settings.title
    }
  }
}
</script>

<style scoped>
.sidebar-logo-container {
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: #2b2f3a;
  overflow: hidden;
  font-size: 14px !important;
}

.sidebar-logo-link {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  height: 50px;
  width: 100%;
  padding-left: 11px;
  text-decoration: none;
}

.sidebar-logo {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
}

.sidebar-title {
  color: #fff;
  font-weight: 600;
  font-size: 18px !important;
  margin-left: 10px;
  white-space: nowrap;
  font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
}

.collapse .sidebar-logo-link {
  justify-content: center;
  padding-left: 0;
}
</style>
