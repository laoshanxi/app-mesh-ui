import request from '@/utils/request'

export function getResources() {
  return request({
    url: '/appmgr/resources',
    method: 'GET'
  })
}
