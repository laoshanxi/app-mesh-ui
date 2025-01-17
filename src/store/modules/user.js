import { login, totpValidate, logout, getInfo, getUserPermissions } from '@/api/user'
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
    const { UserName, Password, Audience } = userInfo
    return new Promise((resolve, reject) => {
      const headers = {
        Authorization: "Basic " + Base64.encode(UserName.trim() + ":" + Password),
        "Expire-Seconds": "604800" // DURATION_ONE_WEEK
      }
      if (Audience) {
        headers.Audience = Audience
      }

      login(headers).then(response => {
        const { data } = response
        if (data['Access-Token']) {
          // Login success without TOTP
          actions.handleLoginSuccess({ commit, data, UserName, Password, resolve, reject })
        } else if (data['Totp-Challenge']) {
          // Login need TOTP
          resolve({
            needTotp: true,
            totpChallenge: data['Totp-Challenge']
          })
        } else {
          console.error('Login failed: Invalid response format', data)
          reject(new Error('Invalid response format'))
        }
      }).catch(error => {
        console.error('Login failed:', error)
        reject(error)
      })
    })
  },

  // TOTP login
  validateTotp({ commit }, { username, challenge, totp, expireSeconds }) {
    return new Promise((resolve, reject) => {
      const headers = {
        Username: Base64.encode(username),
        "Totp-Challenge": Base64.encode(challenge),
        Totp: totp,
        "Expire-Seconds": expireSeconds
      }

      totpValidate(headers).then(response => {
        const { data } = response
        if (data['Access-Token']) {
          actions.handleLoginSuccess({ commit, data, username, resolve, reject })
        } else {
          console.error('TOTP validation failed: Invalid response', data)
          reject(new Error('TOTP validation failed'))
        }
      }).catch(error => {
        console.error('TOTP validation error:', error)
        reject(error)
      })
    })
  },

  handleLoginSuccess({ commit, data, UserName, Password, resolve, reject }) {
    if (!data || !data['Access-Token']) {
      console.error('Login success handler failed: Invalid response', data)
      reject(new Error('Invalid login response'));
      return;
    }

    const user = {
      token: data['Access-Token'],
      name: UserName,
      account: UserName,
      auth: Password,
      avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
    };

    setToken(user.token);
    commit('SET_TOKEN', user.token);
    commit('SET_NAME', user.name);
    commit('SET_ACCOUNT', user.account);
    commit('SET_AUTH', user.auth);
    commit('SET_AVATAR', user.avatar);

    getUserPermissions()
      .then(res => {
        if (!res || !res.data) {
          console.error('Get permissions failed: Invalid response', res)
          throw new Error('Invalid permissions response');
        }
        user.permissions = res.data;
        commit('SET_PERMISSIONS', res.data);
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
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          console.error('Get user info failed: Empty response')
          reject('Verification failed, please Login again.')
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
      commit('SET_TOKEN', '')
      commit('SET_NAME', '')
      commit('SET_ACCOUNT', '')
      commit('SET_AUTH', '')
      commit('SET_AVATAR', '')
      commit('SET_PERMISSIONS', '');  // 添加清除权限
      removeUser();
      removeToken();
      resetRouter();
      resolve();
    });
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
