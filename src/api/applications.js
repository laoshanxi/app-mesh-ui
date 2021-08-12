import request from '@/utils/request'

export function getApplications() {
  return request({
    url: '/appmesh/applications',
    method: 'get'
  })
}

export function getApplicationByName(appname) {
  return request({
    url: '/appmesh/app/' + appname,
    method: 'get'
  })
}

export function getAppLog(appName, pageNo, position, procUuid) {
  let pageIndex = 0
  let pagePosition = 0
  if (pageNo) {
    pageIndex = pageNo
  }
  if (position) {
    pagePosition = position
  }
  return request({
    url: `/appmesh/app/${appName}/output?stdout_index=${pageIndex}&stdout_position=${pagePosition}&process_uuid=${procUuid}`,
    method: 'get'
  })
}

export function registerApplication(appName, data) {
  return request({
    url: '/appmesh/app/' + appName,
    method: 'PUT',
    data: data
  })
}

export function registerShApp(appName, data) {
  return request({
    url: '/appmesh/app/sh/' + appName,
    method: 'PUT',
    data: data
  })
}

export function deleteApplication(appName) {
  return request({
    url: '/appmesh/app/' + appName,
    method: 'DELETE'
  })
}

export function enableApp(appName) {
  return request({
    url: '/appmesh/app/' + appName + '/enable',
    method: 'POST'
  })
}

export function disableApp(appName) {
  return request({
    url: '/appmesh/app/' + appName + '/disable',
    method: 'POST'
  })
}

export function runApp(timeout, sync, options) {
  return request({
    url: '/appmesh/app/' + (sync ? 'syncrun' : 'run') + '?timeout=' + timeout,
    method: 'POST',
    data: options,
    headers: {
      "Accept": "text/plain"
    }
  })
}
