import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function setUser(user){
  sessionStorage["user"] = JSON.stringify(user);
}

export function getUser(){
  return sessionStorage["user"] ? JSON.parse(sessionStorage["user"]) : null;
}

export function removeUser(){
  sessionStorage["user"] = null;
}
