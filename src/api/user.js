import request from '@/utils/request'

export function login(data) {
  data['Expire-Seconds'] = 60 * 60 * 8
  return request({
    url: '/appmesh/login',
    method: 'post',
    headers: data
  })
}

export function authenticate(data) {
  return request({
    url: '/appmesh/auth',
    method: 'post',
    headers: data
  })
}

export function totpValidate(data) {
  return request({
    url: '/appmesh/totp/validate',
    method: 'POST',
    headers: data
  })
}

export function getUserPermissions() {
  return request({
    url: '/appmesh/user/permissions',
    method: 'get'
  })
}

export function locked(UserName) {
  return request({
    url: '/appmesh/user/' + UserName + '/lock',
    method: 'post'
  })
}
export function unlocked(UserName) {
  return request({
    url: '/appmesh/user/' + UserName + '/unlock',
    method: 'post'
  })
}

export function getInfo(token) {
  return request({
    url: '/appmesh/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/appmesh/user/logout',
    method: 'post'
  })
}

export function saveUser(user) {
  return request({
    url: '/appmesh/user/' + user.name,
    method: 'PUT',
    data: user
  })
}

export function delUser(user) {
  return request({
    url: '/appmesh/user/' + user,
    method: 'DELETE'
  })
}

export function getUsers() {
  return request({
    url: '/appmesh/users',
    method: 'GET'
  })
}

export function getGroups() {
  return request({
    url: '/appmesh/user/groups',
    method: 'GET'
  })
}
