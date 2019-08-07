import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/lv/permissions',
    method: 'get',
    params: params
  })
}

export function getTotal() {
  return request({
    url: '/lv/permissions/total',
    method: 'get'
  })
}

export function editPermission(params) {
  return request({
    url: '/lv/permissions/' + params['id'],
    method: 'patch',
    params: params
  })
}

export function refresh() {
  return request({
    url: '/lv/permissions',
    method: 'put'
  })
}
