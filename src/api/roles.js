import request from '@/utils/request'

export function getRoles() {
  return request({
    url: '/appmesh/roles',
    method: 'GET'
  })
}

export function delRole(role) {
  return request({
    url: '/appmesh/role/' + role,
    method: 'DELETE'
  })
}

export function updateRolePermissions(role, permissions) {
  return request({
    url: '/appmesh/role/' + role,
    method: 'POST',
    data: permissions
  })
}
