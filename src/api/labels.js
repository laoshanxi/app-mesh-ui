import request from '@/utils/request'

export function getLabels() {
  return request({
    url: '/appmgr/labels',
    method: 'GET',
  })
}

export function updateLabels(data) {
  return request({
    url: '/appmgr/labels',
    method: 'POST',
    data: data
  })
}

export function updateLabel(labelKey, labelValue) {
  return request({
    url: '/appmgr/label/' + labelKey + '?value=' + labelValue,
    method: 'PUT'
  })
}

export function deleteLabel(labelKey) {
  return request({
    url: '/appmgr/label/' + labelKey,
    method: 'DELETE'
  })
}
