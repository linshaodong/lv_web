import request from '@/utils/request'

export function getUserListPage(params) {
  return request({
    url: '/lv/users',
    method: 'get',
    params: params
  })
}
export function removeUser(params) {
  return request({
    url: '/lv/users/' + params['id'],
    method: 'delete'
  })
}
export function batchRemoveUser(params) {
  return request({
    url: '/lv/users/batch',
    method: 'delete',
    params: params
  })
}
export function editUser(params) {
  return request({
    url: '/lv/users/' + params['id'],
    method: 'put',
    params: params
  })
}
export function addUser(params) {
  return request({
    url: '/lv/users',
    method: 'post',
    params: params
  })
}
