import request from '@/utils/request'

export function getResources() {
  return request({
    url: '/appmesh/resources',
    method: 'GET'
  })
}
