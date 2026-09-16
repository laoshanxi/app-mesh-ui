import { createRouter, createWebHashHistory } from "vue-router";

import Layout from "@/layout/index.vue";

// Route meta legend: hidden = hide in sidebar; alwaysShow keeps a single-child root visible;
// name is needed by <keep-alive>; meta: roles, title, icon, breadcrumb:false, activeMenu.

// constantRoutes — base pages with no permission requirements.
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
    redirect: "/applications/index",
    children: [
      {
        path: "401",
        name: "401",
        component: () => import("@/views/errors/401.vue"),
        meta: { title: "No Permission" },
        hidden: true
      },
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
    path: "/compute",
    component: Layout,
    redirect: "/compute/shell",
    name: "Compute",
    meta: {
      title: "Compute",
      icon: "services"
    },
    children: [
      {
        path: "shell",
        name: "WebShell",
        component: () => import("@/views/shell/index.vue"),
        meta: { title: "Run Shell", icon: "shell" }
      },
      {
        path: "app",
        name: "RunApp",
        component: () => import("@/views/compute/runApp/index.vue"),
        meta: { title: "Run App", icon: "application" }
      },
      {
        path: "task",
        name: "RunTask",
        component: () => import("@/views/compute/task/index.vue"),
        meta: { title: "Run Task", icon: "task" }
      }
    ]
  },
  // Workflow + AI Agent share a group: the engine orchestrates the LLM agent (Scenario A).
  {
    path: "/workflow",
    component: Layout,
    redirect: "/workflow/index",
    name: "WorkflowGroup",
    meta: {
      title: "AI & Workflow",
      icon: "nodes"
    },
    children: [
      {
        path: "index",
        name: "Workflow",
        component: () => import("@/views/workflow/index.vue"),
        meta: { title: "Workflows", icon: "tree" }
      },
      {
        path: "agent/chat",
        name: "AgentChat",
        component: () => import("@/views/agent/Chat.vue"),
        meta: { title: "Chat", icon: "chat" }
      },
      {
        path: "agent/manage",
        name: "AgentManage",
        component: () => import("@/views/agent/index.vue"),
        meta: { title: "Agents", icon: "agent" }
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
  // back-compat for old bookmarks
  {
    path: "/shell",
    redirect: "/compute/shell",
    hidden: true
  },
  {
    path: "/security",
    component: Layout,
    redirect: "/security/principals",
    name: "Security",
    meta: {
      title: "Security",
      icon: "security"
    },
    children: [
      {
        path: "principals",
        name: "Principals",
        component: () => import("@/views/security/principals.vue"),
        meta: {
          title: "Principals",
          icon: "user",
          roles: ["principal-list"]
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
  // 404 catch-all must be last
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
