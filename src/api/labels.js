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

export function updateLabel(labelKey, labelValue) {
  return request({
    url: '/label/' + labelKey + '?value=' + labelValue,
    method: 'PUT'
  })
}

export function deleteLabel(labelKey) {
  return request({
    url: '/label/' + labelKey,
    method: 'DELETE'
  })
}
