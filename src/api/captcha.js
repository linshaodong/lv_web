import request from '@/utils/request'

export function checkCaptcha(params) {
  return request({
    url: '/lv/captchas/check',
    method: 'post',
    data: params
  })
}
