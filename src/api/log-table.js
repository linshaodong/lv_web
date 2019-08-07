import request from '@/utils/request'

export function getLogListPage(params) {
  return request({
    url: '/lv/logs',
    method: 'get',
    params: params
  })
}
