import request from '@/utils/request'

export function getConfig() {
  return request({
    url: '/appmgr/config',
    method: 'GET',
  })
}

export function updateConfig(data) {
  return request({
    url: '/appmgr/config',
    method: 'POST',
    data: data
  })
}

export function getPrometheusData() {
  return request({
    url: '/appmgr/metrics',
    method: 'GET'
  })
}
