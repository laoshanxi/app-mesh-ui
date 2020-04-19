import request from '@/utils/request'

export function login(data) {
  data["expire_seconds"] = 60 * 60 * 8;
  return request({
    url: '/appmgr/login',
    method: 'post',
    headers: data
  })
}

export function getUserPermissions() {
  return request({
    url: '/appmgr/user/permissions',
    method: 'get'
  })
}

export function locked(username) {
  return request({
    url: '/appmgr/user/' + username + '/lock',
    method: 'post',
  })
}
export function unlocked(username) {
  return request({
    url: '/appmgr/user/' + username + '/unlock',
    method: 'post',
  })
}

export function getInfo(token) {
  return request({
    url: '/appmgr/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/appmgr/user/logout',
    method: 'post'
  })
}

export function addUser(user) {
  return request({
    url: '/appmgr/user/'+user.name,
    method: 'PUT',
    data: user
  })
}

export function delUser(user) {
  return request({
    url: '/appmgr/user/'+user,
    method: 'DELETE'
  })
}

export function getUsers() {
  return request({
    url: '/appmgr/users',
    method: 'GET'
  })
}
