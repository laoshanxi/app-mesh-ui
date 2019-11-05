const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  auth: state => state.user.auth,
  baseUrl: state => state.settings.baseUrl,
}
export default getters
