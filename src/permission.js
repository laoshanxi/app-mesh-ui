import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start()
  store.dispatch("app/setLoading", true);

  // set page title
  document.title = getPageTitle(to.meta.title)




  // TODO: When the browser is closed and reopened, the user permission info will be lost.
  // If the user navigates directly to another page without going through the login page,
  // the permissions need to be re-validated.
  const hasGetUserInfo = store.getters.user
  if (hasGetUserInfo) {
    if (to.meta && to.meta.roles && to.meta.roles.length > 0) {
      let curPermissions = to.meta.roles;
      let permissions = hasGetUserInfo.permissions;
      let hasPermission = false;
      if (permissions) {
        for (let i = 0; i < curPermissions.length; i++) {
          if (permissions.indexOf(curPermissions[i]) >= 0) {
            hasPermission = true;
            break;
          }
        }
      }

      if (hasPermission) {
        next();
      } else {
        next('/401');
        NProgress.done();
        setTimeout(() => {
          store.dispatch("app/setLoading", false);
        }, 1000);
      }
    } else {
      next();
    }
  } else {
    try {
      // get user info
      await store.dispatch('user/getInfo')

      next()
    } catch (error) {
      Message.error(error || 'Has Error')
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }

})

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
  setTimeout(() => {
    store.dispatch("app/setLoading", false);
  }, 1000);
})
