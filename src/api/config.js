import request from '@/utils/request'

export function getConfig() {
  return request({
    url: '/appmesh/config',
    method: 'GET',
  })
}

export function updateConfig(data) {
  return request({
    url: '/appmesh/config',
    method: 'POST',
    data: data
  })
}

export function getPrometheusData() {
  return request({
    url: '/appmesh/metrics',
    method: 'GET'
  })
}
