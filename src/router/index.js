import { createRouter, createWebHashHistory } from "vue-router";

/* Layout */
import Layout from "@/layout/index.vue";

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    hidden: true
  },

  {
    path: "/404",
    component: () => import("@/views/404.vue"),
    hidden: true
  },

  {
    path: "/",
    component: Layout,
    redirect: "/applications/index"
  },
  {
    path: "/",
    component: Layout,
    redirect: "/401",
    hidden: true,
    children: [
      {
        path: "401",
        name: "401",
        component: () => import("@/views/errors/401.vue"),
        meta: { title: "No Permission" },
        hidden: true
      }
    ]
  },
  {
    path: "/",
    component: Layout,
    redirect: "/home",
    children: [
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/home/index.vue"),
        meta: { title: "Home", icon: "home" },
        hidden: true
      }
    ]
  },
  {
    path: "/applications",
    component: Layout,
    children: [
      {
        path: "index",
        name: "Applications",
        component: () => import("@/views/applications/index.vue"),
        meta: { title: "Applications", icon: "application" }
      }
    ]
  },
  {
    path: "/host",
    component: Layout,
    children: [
      {
        path: "index",
        name: "Host",
        component: () => import("@/views/host/index.vue"),
        meta: { title: "Host", icon: "host" }
      }
    ]
  },
  {
    path: "/shell",
    component: Layout,
    children: [
      {
        path: "index",
        name: "WebShell",
        component: () => import("@/views/shell/index.vue"),
        meta: { title: "WebShell", icon: "shell" }
      }
    ]
  },
  {
    path: "/security",
    component: Layout,
    redirect: "/security/changePwd",
    name: "Security",
    meta: {
      title: "Security",
      icon: "security"
    },
    children: [
      {
        path: "users",
        name: "Users",
        component: () => import("@/views/security/users.vue"),
        meta: {
          title: "Users",
          icon: "user",
          roles: ["user-list"]
        }
      },
      {
        path: "roles",
        name: "Roles",
        component: () => import("@/views/security/roles.vue"),
        meta: {
          title: "Roles",
          icon: "role",
          roles: ["role-view"]
        }
      },
      {
        path: "changePwd",
        name: "ChangePwd",
        component: () => import("@/views/security/changePwd.vue"),
        meta: { title: "Password", icon: "password" }
      }
    ]
  },
  {
    path: "/files",
    component: Layout,
    children: [
      {
        path: "index",
        name: "File Management",
        component: () => import("@/views/files/index.vue"),
        meta: { title: "File Management", icon: "files" }
      }
    ]
  },
  {
    path: "/prometheus",
    component: Layout,
    children: [
      {
        path: "index",
        name: "Prometheus",
        component: () => import("@/views/prometheus/index.vue"),
        meta: { title: "Prometheus", icon: "Prometheus" }
      }
    ]
  },
  {
    path: "/config",
    component: Layout,
    children: [
      {
        path: "index",
        name: "Config",
        component: () => import("@/views/config/index.vue"),
        meta: { title: "Configuration", icon: "config" }
      }
    ]
  },
  {
    path: "/refresh",
    component: () => import("@/views/refresh.vue"),
    hidden: true
  },
  // 404 page must be placed at the end !!!
  { path: "/:pathMatch(.*)*", redirect: "/404", hidden: true }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes
});

export function resetRouter() {
  const newRouter = createRouter({
    history: createWebHashHistory(),
    scrollBehavior: () => ({ top: 0 }),
    routes: constantRoutes
  });
  // Remove all existing routes and re-add from constantRoutes
  router.getRoutes().forEach(route => {
    const name = route.name;
    if (name) {
      router.removeRoute(name);
    }
  });
  newRouter.getRoutes().forEach(route => {
    router.addRoute(route);
  });
}

export default router;
