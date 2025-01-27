import defaultSettings from '@/settings'
import { setDataLocalStorage, getDataLocalStorage } from '@/utils/localStorage'
import constants from '@/utils/constants'

const { showSettings, fixedHeader, sidebarLogo, forwarding, title } = defaultSettings

const state = {
  forwarding: getDataLocalStorage(constants.FORWARDING) || forwarding,
  apiUrls: getDataLocalStorage(constants.API_URLS),
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  title: title,
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if (Object.prototype.hasOwnProperty.call(state, key)) {
      state[key] = value
    }
    if (key == "forwarding") {
      if (state.apiUrls == null) {
        state.apiUrls = getDataLocalStorage(constants.API_URLS);
      }
      if (!state.apiUrls) {
        state.apiUrls = [];
      }
      let createFilter = function (queryString) {
        if (!queryString || queryString.trim() === '') {
          return () => false;
        }
        return (url) => {
          return (url && url.value && typeof url.value === 'string' && url.value.toLowerCase().trim() === queryString.toLowerCase().trim());
        };
      }

      if (state.apiUrls.filter(createFilter(value)).length == 0) {
        state.apiUrls.push({
          value: value
        });
      }
      setDataLocalStorage(constants.API_URLS, state.apiUrls);
      setDataLocalStorage(constants.FORWARDING, value);
    }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data);
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
