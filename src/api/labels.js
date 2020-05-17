import request from '@/utils/request'

export function getLabels() {
  return request({
    url: '/appmesh/labels',
    method: 'GET',
  })
}

export function updateLabels(data) {
  return request({
    url: '/appmesh/labels',
    method: 'POST',
    data: data
  })
}

export function updateLabel(labelKey, labelValue) {
  return request({
    url: '/appmesh/label/' + labelKey + '?value=' + labelValue,
    method: 'PUT'
  })
}

export function deleteLabel(labelKey) {
  return request({
    url: '/appmesh/label/' + labelKey,
    method: 'DELETE'
  })
}
