import router from "./router";
import store from "./store";
import { ElMessage } from "element-plus";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import getPageTitle from "@/utils/get-page-title";
import { completeAuthorizationLogin } from "@/utils/oidc";

NProgress.configure({ showSpinner: false });

// Validate the cached session once per page-load (the sessionStorage identity is otherwise trusted blindly).
let sessionValidated = false;

const hasRequiredPermission = (userPermissions, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) return false;
  if (requiredRoles.length === 0) return true;

  if (!Array.isArray(userPermissions) || userPermissions.length === 0)
    return false;

  return requiredRoles.some(
    (role) => typeof role === "string" && userPermissions.includes(role)
  );
};

const finishLoading = (immediate = false) => {
  NProgress.done();

  if (immediate) {
    store.dispatch("app/setLoading", false);
    return;
  }

  setTimeout(() => {
    store.dispatch("app/setLoading", false);
  }, 300);
};

const handleRouterError = (error, type = "error") => {
  console.error(`Router ${type}:`, error);

  if (error?.message) {
    ElMessage.error(error.message);
  }

  finishLoading(true);
};

router.beforeEach(async (to, from, next) => {
  // The Dex redirect lands on /oauth/callback?code&state (directly or via an entry relay);
  // the hash router never routes it, so exchange the code here before any navigation.
  if (window.location.search.includes("code=")) {
    let result;
    try {
      result = await completeAuthorizationLogin();
    } catch (error) {
      console.error("Authorization callback failed:", error);
      ElMessage.error(error?.message || "Login failed");
      next("/login");
      return;
    }
    if (result === "relayed") return;
  }

  NProgress.start();
  store.dispatch("app/setLoading", true);

  document.title = getPageTitle(to.meta?.title);

  const userInfo = store.getters.user;

  if (to.path === "/login") {
    if (userInfo?.name) {
      next({ path: "/" });
    } else {
      next();
    }
    return;
  }

  if (!userInfo?.name) {
    try {
      // No cached identity: verify with the server (or go to login).
      await store.dispatch("user/getInfo");
      sessionValidated = true;
      next({ ...to, replace: true });
    } catch (error) {
      await store.dispatch("user/logout");
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
    return;
  }

  // Cached identity not yet validated this page-load: confirm it is alive, else re-login.
  if (!sessionValidated) {
    try {
      await store.dispatch("user/getInfo");
      sessionValidated = true;
    } catch (error) {
      await store.dispatch("user/logout");
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
      return;
    }
  }

  if (
    to.meta?.roles &&
    !hasRequiredPermission(userInfo.permissions, to.meta.roles)
  ) {
    ElMessage.error("You do not have permission to access this page");
    next({ path: "/401", replace: true });
    return;
  }

  next();
});

router.afterEach(() => {
  finishLoading(true);
});

router.onError((error) => {
  handleRouterError(error);
  finishLoading(true);
});
