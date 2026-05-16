const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  forwarding: state => state.settings.forwarding,
  apiUrls: state => state.settings.apiUrls,
  loading: state => state.app.loading,
  user: state => state.user,
}
export default getters
