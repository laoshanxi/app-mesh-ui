import request from '@/utils/request'

export function getApplications() {
  return request({
    url: '/app-manager/applications',
    method: 'get'
  })
}

export function getApplicationByName(appname) {
  return request({
    url: '/app/'+appname,
    method: 'get'
  })
}

export function getAppLog(appname) {
  return request({
    url: `/app/${appname}/output?keep_history=1`,
    method: 'get'
  })
}

export function registerApplication(appName, data) {
  return request({
    url: '/app/' + appName,
    method: 'PUT',
    data: data
  })
}

export function registerShApp(appName, data) {
  return request({
    url: '/app/sh/' + appName,
    method: 'PUT',
    data: data
  })
}

export function deleteApplication(appName) {
  return request({
    url: '/app/' + appName,
    method: 'DELETE'
  })
}

export function enableApp(appName) {
  return request({
    url: '/app/' + appName + '/enable',
    method: 'POST'
  })
}

export function disableApp(appName) {
  return request({
    url: '/app/' + appName + '/disable',
    method: 'POST'
  })
}

export function runApp(timeout, sync, options) {
  return request({
    url: '/app/' + (sync ? 'syncrun' : 'run') + '?timeout=' + timeout,
    method: 'POST',
    data: options
  })
}

export function getOutput(appName, pid) {
  return request({
    url: '/app/' + appName + '/run/output?process_uuid='+pid,
    method: 'GET'
  })
}
