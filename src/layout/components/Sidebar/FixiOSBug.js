export default {
  computed: {
    device() {
      return this.$store.state.app.device
    }
  },
  mounted() {
    // iOS menu click triggers mouseleave (vue-element-admin#1135)
    this.fixBugIniOS()
  },
  methods: {
    fixBugIniOS() {
      const $subMenu = this.$refs.subMenu
      if ($subMenu) {
        const handleMouseleave = $subMenu.handleMouseleave
        $subMenu.handleMouseleave = (e) => {
          if (this.device === 'mobile') {
            return
          }
          handleMouseleave(e)
        }
      }
    }
  }
}
