import { login, logout, getInfo } from '@/api/login'
import Cookies from 'js-cookie'
import {
  setToken,
  removeToken,
  getUserId
} from '@/utils/auth'
import {
  setStore,
  getStore,
  removeStore
} from '@/utils/store'
const user = {
  state: {
    token: '',
    userId: 0,
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
    isLock: getStore({
      name: 'isLock'
    }) || false,
    lockPasswd: getStore({
      name: 'lockPasswd'
    }) || '',
    browserHeaderTitle: getStore({
      name: 'browserHeaderTitle'
    }) || 'NxAdmin'
  },

  mutations: {
    LOG_OUT: (state) => {
      removeToken()
      Cookies.remove('userId')
      Cookies.remove('name')
      Cookies.remove('roles')
      Cookies.remove('permissions')

      state = {
        token: '',
        userId: 0,
        name: '',
        avatar: '',
        roles: [],
        permissions: [],
        isLock: getStore({
          name: 'isLock'
        }) || false,
        lockPasswd: getStore({
          name: 'lockPasswd'
        }) || '',
        browserHeaderTitle: getStore({
          name: 'browserHeaderTitle'
        }) || 'NxAdmin'
      }
    },
    SET_TOKEN: (state, token) => {
      state.token = token
      setToken(token)
    },
    SET_USER_ID: (state, token) => {
      var arr = token.split('|')
      state.userId = arr[2]
      Cookies.set('userId', arr[2])
    },
    SET_NAME: (state, name) => {
      state.name = name
      Cookies.set('name', name)
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
      Cookies.set('roles', roles)
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
      Cookies.set('permissions', permissions)
    },
    SET_LOCK_PASSWD: (state, lockPasswd) => {
      state.lockPasswd = lockPasswd
      setStore({
        name: 'lockPasswd',
        content: state.lockPasswd,
        type: 'session'
      })
    },
    SET_LOCK: (state, action) => {
      state.isLock = true
      setStore({
        name: 'isLock',
        content: state.isLock,
        type: 'session'
      })
    },
    CLEAR_LOCK: (state, action) => {
      state.isLock = false
      state.lockPasswd = ''
      removeStore({
        name: 'lockPasswd'
      })
      removeStore({
        name: 'isLock'
      })
    },
    SET_BROWSERHEADERTITLE: (state, action) => {
      state.browserHeaderTitle = action.browserHeaderTitle
    }

  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const user_name = userInfo.user_name.trim()
      return new Promise((resolve, reject) => {
        login(user_name, userInfo.password, userInfo.vcode).then(response => {
          const data = response
          commit('SET_TOKEN', data.token)
          commit('SET_USER_ID', data.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo(getUserId()).then(response => {
          const data = response
          if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', data.roles)
            commit('SET_PERMISSIONS', data.permissions)
          } else {
            reject('getInfo: roles must be a non-null array !')
          }
          commit('SET_NAME', data.user_name)
          commit('SET_AVATAR', data.avatar)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(getUserId()).then(() => {
          commit('LOG_OUT')
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('LOG_OUT')
        resolve()
      })
    }
  }
}

export default user
