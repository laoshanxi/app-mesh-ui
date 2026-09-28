import store from "@/store";

// OR semantics: any one of `required` grants access; empty/absent required means public.
export const checkPermission = (userPermissions, required) => {
  if (!required) return true;
  const requiredList = Array.isArray(required) ? required : [required];
  if (requiredList.length === 0) return true;

  const granted = Array.isArray(userPermissions) ? userPermissions : [];
  if (granted.length === 0) return false;

  return requiredList.some(
    (perm) => typeof perm === "string" && granted.includes(perm)
  );
};

export const hasPermission = (required) =>
  checkPermission(store.getters.user?.permissions, required);

// Clone the route table keeping only entries the user may see; a group whose
// children were all filtered out is dropped as well.
export const filterRoutes = (routes, userPermissions) => {
  const granted =
    userPermissions === undefined
      ? store.getters.user?.permissions
      : userPermissions;

  const accessible = [];
  routes.forEach((route) => {
    if (!checkPermission(granted, route.meta?.roles)) return;

    const copy = { ...route };
    if (copy.children) {
      copy.children = filterRoutes(copy.children, granted);
      if (route.children.length > 0 && copy.children.length === 0) return;
    }
    accessible.push(copy);
  });
  return accessible;
};

// First non-hidden navigable leaf path of an (already filtered) route table.
export const firstMenuPath = (routes, basePath = "") => {
  for (const route of routes) {
    if (route.hidden) continue;
    const fullPath = route.path.startsWith("/")
      ? route.path
      : `${basePath.replace(/\/$/, "")}/${route.path}`;

    if (route.children && route.children.length > 0) {
      const childPath = firstMenuPath(route.children, fullPath);
      if (childPath) return childPath;
    } else if (!route.redirect) {
      return fullPath;
    }
  }
  return "";
};
