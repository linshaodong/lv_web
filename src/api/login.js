import request from '@/utils/request'

export function login(user_name, password, vcode) {
  return request({
    url: '/lv/tokens',
    method: 'post',
    data: {
      user_name,
      password,
      vcode
    }
  })
}

export function getInfo(userId) {
  return request({
    url: '/lv/users/' + userId,
    method: 'get'
  })
}

export function logout(userId) {
  return request({
    url: '/lv/tokens/' + userId,
    method: 'delete'
  })
}
