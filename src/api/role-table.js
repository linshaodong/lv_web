import request from '@/utils/request'

export function getRoleTotal() {
  return request({
    url: '/lv/roles/total',
    method: 'get'
  })
}
export function getRoleListPage(params) {
  return request({
    url: '/lv/roles',
    method: 'get',
    params: params
  })
}
export function removeRole(params) {
  return request({
    url: '/lv/roles/' + params['id'],
    method: 'delete'
  })
}
export function batchRemoveRole(params) {
  return request({
    url: '/lv/roles/batch',
    method: 'delete',
    params: params
  })
}
export function editRole(id, params) {
  return request({
    url: '/lv/roles/' + id,
    method: 'put',
    data: params
  })
}
export function addRole(params) {
  return request({
    url: '/lv/roles',
    method: 'post',
    data: params
  })
}
