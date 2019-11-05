import request from '@/utils/request'

export function getApplications() {
  return request({
    url: '/app-manager/applications',
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

export function startApp(appName) {
  return request({
    url: '/app/' + appName + '?action=start',
    method: 'POST'
  })
}

export function stopApp(appName) {
  return request({
    url: '/app/' + appName + '?action=stop',
    method: 'POST'
  })
}

export function runApp(appName, timeout, sync, options) {
  return request({
    url: '/app/' + appName + '/' + (sync ? 'syncrun' : 'run') + '?timeout=' + timeout,
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
