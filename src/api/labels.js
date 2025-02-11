import request from '@/utils/request'
import { getClient } from '@/utils'

export function getLabels() {
  const client = getClient();
  return client.view_tags().then(data => ({ data }));
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
