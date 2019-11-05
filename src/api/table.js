import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/app-manager/applications',
    method: 'get',
    params
  })
}
