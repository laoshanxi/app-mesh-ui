import router from "./router";
import store from "./store";
import { ElMessage } from "element-plus";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import getPageTitle from "@/utils/get-page-title";

// Configure NProgress
NProgress.configure({ showSpinner: false });

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/login"];

/**
 * Checks if user has the required permissions to access a route
 * @param {string[]} userPermissions - User's permission list
 * @param {string[]} requiredRoles - Roles required for the route
 * @returns {boolean} True if user has necessary permissions
 */
const hasRequiredPermission = (userPermissions, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) return false;
  if (requiredRoles.length === 0) return true;

  if (!Array.isArray(userPermissions) || userPermissions.length === 0)
    return false;

  return requiredRoles.some(
    (role) => typeof role === "string" && userPermissions.includes(role)
  );
};

/**
 * Completes loading state
 * @param {boolean} immediate - Whether to finish immediately without delay
 */
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

/**
 * Handles router errors consistently
 * @param {Error} error - The error object
 * @param {string} type - Error type for logging
 */
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

  // Allow access to public routes without authentication
  if (PUBLIC_ROUTES.includes(to.path)) {
    next();
    return;
  }

  // Redirect logged-in users away from login page
  if (to.path === "/login" && userInfo?.name) {
    next({ path: "/" });
    return;
  }

  // Handle authentication check
  if (!userInfo?.name) {
    try {
      // Try to get user info (e.g., from token)
      await store.dispatch("user/getInfo");
      // Continue to requested page after successful authentication
      next({ ...to, replace: true });
    } catch (error) {
      // Authentication failed, redirect to login
      await store.dispatch("user/logout");
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
    return;
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
