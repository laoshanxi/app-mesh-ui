import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/appmesh/applications',
    method: 'get',
    params
  })
}
