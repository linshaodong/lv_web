import request from '@/utils/request'

export function upload(file) {
  return request({
    url: '/lv/uploads',
    method: 'post',
    data: {
      file
    }
  })
}
