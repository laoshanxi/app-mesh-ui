import request from '@/utils/request'

export function getRoles() {
  return request({
    url: '/appmgr/roles',
    method: 'GET'
  })
}

export function updateRolePermissions(role, permissions) {
  return request({
    url: '/appmgr/role/' + role,
    method: 'POST',
    data: permissions
  })
}
