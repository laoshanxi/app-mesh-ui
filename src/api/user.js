import request from '@/utils/request'

export function login(data) {
  data["expire_seconds"] = 60 * 60 * 8;
  return request({
    url: '/login',
    method: 'post',
    headers: data
  })
}

export function getPermissions() {
  return request({
    url: '/auth/permissions',
    method: 'get'
  })
}

export function locked(username) {
  return request({
    url: '/user/' + username + '/lock',
    method: 'post',
  })
}
export function unlocked(username) {
  return request({
    url: '/user/' + username + '/unlock',
    method: 'post',
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
