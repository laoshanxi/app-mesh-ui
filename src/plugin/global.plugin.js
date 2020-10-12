export default {
  install (Vue, options) {
    Vue.prototype.$clone = function (obj) {
      if(obj){
        return JSON.parse(JSON.stringify(obj));
      }
      return null;
    }
  }
}
