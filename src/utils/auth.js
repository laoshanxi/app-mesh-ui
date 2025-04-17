export function setUser(user) {
  sessionStorage["user"] = JSON.stringify(user);
}

export function getUser() {
  return sessionStorage["user"] ? JSON.parse(sessionStorage["user"]) : null;
}

export function removeUser() {
  sessionStorage["user"] = null;
}
