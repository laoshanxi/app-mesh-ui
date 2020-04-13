import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/appmgr/applications',
    method: 'get',
    params
  })
}
