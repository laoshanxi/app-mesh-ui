import request from '@/utils/request'

export function getLabels() {
  return request({
    url: '/labels',
    method: 'GET',
  })
}

export function updateLabels(data) {
  return request({
    url: '/labels',
    method: 'POST',
    data: data
  })
}
