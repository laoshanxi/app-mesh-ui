import request from '@/utils/request'

export function updatePwd (user, data) {
  return request({
    url: '/appmesh/user/' + user + '/passwd',
    method: 'POST',
    headers: data
  })
}

export function getPermissions () {
  return request({
    url: '/appmesh/permissions',
    method: 'get'
  })
}

export function userSelf () {
  return request({
    url: '/appmesh/user/self',
    method: 'get'
  })
}

export function getTotpSecret () {
  return request({
    url: '/appmesh/totp/secret',
    method: 'post'
  })
}

export function setupTotp (totp) {
  return request({
    url: '/appmesh/totp/setup',
    method: 'post',
    headers: {
      'Totp': totp
    }
  })
}

export function disableTotp (username) {
  return request({
    url: `/appmesh/totp/${username}/disable`,
    method: 'post'
  })
}
