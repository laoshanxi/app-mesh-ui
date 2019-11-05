import request from '@/utils/request'

export function login(data) {
  data["expire_seconds"] = 60 * 60 * 8;
  return request({
    url: '/login',
    method: 'post',
    headers: data
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
