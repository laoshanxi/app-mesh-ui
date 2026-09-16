import { setUser, getUser, removeUser } from '@/utils/auth'
import { getClient, clearClient } from '@/utils/appmeshClient'
import { passwordLogin, hasSession, clearSession, ensureFreshToken } from '@/utils/oidc'
import { resetRouter } from '@/router'

const user = getUser();

const state = {
  name: user?.name || '',
  account: user?.account || '',
  avatar: user?.avatar || '',
  permissions: user?.permissions || '',
}

const mutations = {
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_ACCOUNT: (state, account) => {
    state.account = account
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // password grant against Dex (builtin mode); PKCE logins complete in the router guard (oidc.js).
  login({ commit }, userInfo) {
    const { UserName, Password } = userInfo
    return passwordLogin(UserName, Password).then(() => {
      return actions.handleLoginSuccess({ commit, resolve: null, reject: null })
    })
  },

  // Fetch principal + effective permissions and persist the UI session.
  handleLoginSuccess({ commit }) {
    const client = getClient()
    return client.get_current_principal().then(async (principal) => {
      const name = principal.display_name || principal.principal_id
      const account = principal.principal_id

      commit('SET_NAME', name)
      commit('SET_ACCOUNT', account)
      commit('SET_AVATAR', '')

      const permissions = await client.get_principal_permissions()
      commit('SET_PERMISSIONS', permissions)
      setUser({ name, account, avatar: '', permissions })
      return { name, account, permissions }
    })
  },

  // Validate the stored Dex token and (re)load identity + permissions.
  // Refresh an expired/near-expiry token first so a restored session
  // survives startup instead of bouncing to the login page on a 401.
  async getInfo({ commit }) {
    if (!hasSession()) {
      return Promise.reject(new Error('No active session'))
    }
    await ensureFreshToken()
    return getClient().get_current_principal().then((principal) => {
      if (!principal) {
        return Promise.reject(new Error('Verification failed, please Login again.'))
      }

      const name = principal.display_name || principal.principal_id
      const account = principal.principal_id
      commit('SET_NAME', name)
      commit('SET_ACCOUNT', account)
      commit('SET_AVATAR', '')

      return getClient().get_principal_permissions().then((permissions) => {
        commit('SET_PERMISSIONS', permissions)
        setUser({ name, account, avatar: '', permissions })
        return principal
      })
    })
  },

  // Drop the local session; no server-side logout — RP-initiated logout is the IdP portal's job.
  logout({ commit }) {
    return new Promise((resolve) => {
      clearSession()
      getClient().clear_bearer_token()
      commit('SET_NAME', '')
      commit('SET_ACCOUNT', '')
      commit('SET_AVATAR', '')
      commit('SET_PERMISSIONS', '')
      removeUser()
      clearClient() // drop the cached client instance
      resetRouter()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
