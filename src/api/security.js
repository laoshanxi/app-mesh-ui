import request from '@/utils/request'

export function updatePwd(user, data) {
  return request({
    url: '/user/'+user+'/passwd',
    method: 'POST',
    headers: data
  })
}
