import request from '@/utils/request'

export function updatePwd(user, data) {
  return request({
    url: '/appmesh/user/'+user+'/passwd',
    method: 'POST',
    headers: data
  })
}

export function getPermissions() {
  return request({
    url: '/appmesh/permissions',
    method: 'get'
  })
}
