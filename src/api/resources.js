import request from '@/utils/request'

export function getResources() {
  return request({
    url: '/app-manager/resources',
    method: 'GET'
  })
}
