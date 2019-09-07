import Cookies from 'js-cookie'
import store from '@/store'
const TokenKey = 'X-Token'

export function getToken() {
  return store.getters.token ? store.getters.token : Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getDeviceId() {
  return localStorage.getItem('Device-Id')
}

export function getUserId() {
  return store.getters.userId ? store.getters.userId : Cookies.get('userId')
}
export function getName() {
  return store.getters.name ? store.getters.name : Cookies.get('name')
}
export function getRoles() {
  return store.getters.roles ? store.getters.roles : Cookies.get('roles')
}
export function getPermissions() {
  return store.getters.permissions ? store.getters.permissions : Cookies.get('permissions')
}
