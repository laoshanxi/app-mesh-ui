import { login, logout, getInfo, getUserPermissions } from '@/api/user'
import { getToken, setToken, removeToken, setUser, getUser, removeUser } from '@/utils/auth'
import { resetRouter } from '@/router'
import { Base64 } from 'js-base64'

let user = getUser();

const state = {
  token: getToken(),
  name: user ? user.name : '',
  account: user ? user.account : '',
  auth: user ? user.auth : '',
  avatar: user ? user.avatar : '',
  permissions: user ? user.permissions : '',
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
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
    const { UserName, Password } = userInfo
    return new Promise((resolve, reject) => {
      login({ Username: Base64.encode(UserName.trim()), Password: Base64.encode(Password) }).then(response => {
        const { data } = response;
        let user = {
          token: data['Access-Token'],
          name: data.profile.name,
          account: UserName,
          auth: Password,
          avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
        };
        setToken(user.token);
        commit('SET_TOKEN', user.token);
        commit('SET_NAME', user.name);
        commit('SET_ACCOUNT', user.UserName);
        commit('SET_AUTH', user.auth);
        commit('SET_AVATAR', user.avatar);
        getUserPermissions().then(res=>{
          user.permissions = res.data;
          commit('SET_PERMISSIONS', res.data);
          setUser(user);
          resolve()
        }).catch(error => {
          this.logout();
          reject(error)
        })
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { name, avatar } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      commit('SET_TOKEN', '')
      commit('SET_NAME', '')
      commit('SET_ACCOUNT', '')
      commit('SET_AUTH', '')
      commit('SET_AVATAR', '')
      removeUser();
      removeToken();
      resetRouter()
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
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
