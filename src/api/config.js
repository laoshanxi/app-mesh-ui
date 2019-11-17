import request from '@/utils/request'

export function getConfig() {
  return request({
    url: '/app-manager/config',
    method: 'GET',
  })
}

export function updateConfig(data) {
  return request({
    url: '/app-manager/config',
    method: 'POST',
    data: data
  })
}
