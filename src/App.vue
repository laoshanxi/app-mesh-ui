<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  watch: {
    $route: {
      handler(to) {
        try {
          const baseTitle = window.VUE_APP_TITLE || process.env.VUE_APP_TITLE || 'App Mesh';
          const pageTitle = to.meta?.title?.trim();
          document.title = pageTitle ? `${baseTitle} - ${pageTitle}` : baseTitle;
        } catch (err) {
          console.error('Failed to update document title:', err);
        }
      },
      immediate: true
    }
  }
}
</script>
