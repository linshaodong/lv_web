import request from '@/utils/request'
import store from '@/store'

export function login(user_name, password) {
  return request({
    url: '/lv/tokens',
    method: 'post',
    data: {
      user_name,
      password
    }
  })
}

export function getInfo() {
  return request({
    url: '/lv/users/' + store.getters.userId,
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/lv/tokens/' + store.getters.userId,
    method: 'delete'
  })
}
