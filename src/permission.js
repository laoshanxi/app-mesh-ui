import router from "./router";
import store from "./store";
import { ElMessage } from "element-plus";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import getPageTitle from "@/utils/get-page-title";

// Configure NProgress
NProgress.configure({ showSpinner: false });

// Has the restored (cached) session been validated against the server this page-load?
// The user identity is cached in sessionStorage, so the guard would otherwise trust it
// blindly — even if the auth cookie is stale (daemon restarted / expired). We validate
// once via get_current_user so a dead session is sent to login instead of showing a
// logged-in-looking UI whose API calls all fail.
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

// Navigation guard - runs before each route change
router.beforeEach(async (to, from, next) => {
  // Start loading indicators
  NProgress.start();
  store.dispatch("app/setLoading", true);

  // Set page title based on route metadata
  document.title = getPageTitle(to.meta?.title);

  const userInfo = store.getters.user;

  // Redirect logged-in users away from login page
  if (to.path === "/login") {
    if (userInfo?.name) {
      next({ path: "/" });
    } else {
      next();
    }
    return;
  }

  // Handle authentication check
  if (!userInfo?.name) {
    try {
      // No cached identity: verify the session cookie with the server (or go to login).
      await store.dispatch("user/getInfo");
      sessionValidated = true;
      // Continue to requested page after successful authentication
      next({ ...to, replace: true });
    } catch (error) {
      // Authentication failed, redirect to login
      await store.dispatch("user/logout");
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
    return;
  }

  // Cached identity restored from sessionStorage but not yet validated this page-load:
  // confirm the session is actually alive, else force re-login.
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

  // Check route permission requirements
  if (
    to.meta?.roles &&
    !hasRequiredPermission(userInfo.permissions, to.meta.roles)
  ) {
    ElMessage.error("You do not have permission to access this page");
    next({ path: "/401", replace: true }); // Redirect without adding to history
    return;
  }

  // Proceed with navigation
  next();
});

// After each successful navigation
router.afterEach(() => {
  finishLoading(true);
});

// Global error handler for router
router.onError((error) => {
  handleRouterError(error);
  finishLoading(true);
});
