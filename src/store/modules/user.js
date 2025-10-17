import { setUser, getUser, removeUser } from '@/utils/auth'
import { getClient } from '@/utils/appmeshClient'
import { resetRouter } from '@/router'

let user = getUser();

const state = {
  name: user ? user.name : '',
  account: user ? user.account : '',
  auth: user ? user.auth : '',
  avatar: user ? user.avatar : '',
  permissions: user ? user.permissions : '',
}

const mutations = {
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_ACCOUNT: (state, account) => {
    state.account = account
  },
  SET_AUTH: (state, auth) => {
    state.auth = auth
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { UserName, Password, Audience } = userInfo
    return new Promise((resolve, reject) => {
      getClient().login(UserName, Password, null, 'P1D', Audience).then(() => {
        // Login success without TOTP
        actions.handleLoginSuccess({ commit, UserName, Password, resolve, reject })
      }).catch(error => {
        reject(error)
      })
    })
  },

  // TOTP login
  validateTotp({ commit }, { username, challenge, totp, expireSeconds }) {
    return new Promise((resolve, reject) => {
      getClient().validate_totp(username, challenge, totp, expireSeconds).then(() => {
        actions.handleLoginSuccess({ commit, username, resolve, reject })
      }).catch(error => {
        console.error('TOTP validation error:', error)
        reject(error)
      })
    })
  },

  handleLoginSuccess({ commit, UserName, Password, resolve, reject }) {
    const user = {
      name: UserName,
      account: UserName,
      auth: Password,
      avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
    };

    commit('SET_NAME', user.name);
    commit('SET_ACCOUNT', user.account);
    commit('SET_AUTH', user.auth);
    commit('SET_AVATAR', user.avatar);

    getClient().get_user_permissions()
      .then(res => {
        user.permissions = res;
        commit('SET_PERMISSIONS', res);
        setUser(user);
        resolve({ needTotp: false });
      })
      .catch(error => {
        console.error('Get permissions error:', error)
        actions.logout({ commit });
        reject(error);
      });
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getClient().get_current_user().then(data => {
        if (!data) {
          console.error('Get user info failed: Empty response')
          reject('Verification failed, please Login again.')
          return
        }

        const { name, avatar } = data
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        console.error('Get user info error:', error)
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit }) {
    return new Promise((resolve) => {
      getClient().logout().then(() => {
        console.log('Logged off')
      }).catch((error) => {
        console.error('Failed to log off:', error)
      })
      commit('SET_NAME', '')
      commit('SET_ACCOUNT', '')
      commit('SET_AUTH', '')
      commit('SET_AVATAR', '')
      commit('SET_PERMISSIONS', '')
      removeUser()
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
