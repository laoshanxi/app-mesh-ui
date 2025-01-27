module.exports = {
  title: process.env.VUE_APP_TITLE || 'App Mesh',

  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: false,

  /**
   * @type {boolean} true | false
   * @description Whether show the logo in sidebar
   */
  sidebarLogo: true,

  /**
   * @type {string}
   * @description target host address for request forwarding in a cluster setup.
   */
  forwarding: ''
}
