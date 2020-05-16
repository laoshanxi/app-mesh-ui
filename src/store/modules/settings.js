import defaultSettings from '@/settings'
import {setDataLocalStorage, getDataLocalStorage} from '@/utils/localStorage'
import constants from '@/utils/constants'

const { showSettings, fixedHeader, sidebarLogo, baseUrl, title } = defaultSettings

const state = {
  baseUrl: getDataLocalStorage(constants.BASE_URL) || baseUrl,
  apiUrls: getDataLocalStorage(constants.API_URLS),
  showSettings: showSettings,
  fixedHeader: fixedHeader,
  sidebarLogo: sidebarLogo,
  title: title,
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    if(key == "baseUrl"){
      if(state.apiUrls==null){
        state.apiUrls = getDataLocalStorage(constants.API_URLS);
      }
      if(!state.apiUrls){
        state.apiUrls = [];
      }
      let createFilter=function(queryString) {
        return (url) => {
          return (url.value.toLowerCase().trim()==queryString.toLowerCase().trim());
        };
      }

      if(state.apiUrls.filter(createFilter(value)).length==0){
        state.apiUrls.push({
          value: value
        });
      }
      setDataLocalStorage(constants.API_URLS, state.apiUrls);
      setDataLocalStorage(constants.BASE_URL, value);

    }
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
