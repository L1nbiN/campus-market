import { defineStore } from 'pinia'
import { login as loginRequest } from '@/api/user'
import { TOKEN_KEY, USER_KEY } from '@/utils/storage'

function readCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * 用户状态：token 与用户信息从 localStorage 初始化，
 * 刷新页面后仍保持登录态。
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    userInfo: readCachedUser()
  }),

  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    displayName: (state) => state.userInfo?.name || state.userInfo?.username || '同学'
  },

  actions: {
    /**
     * 登录：成功后持久化 token 与用户信息
     */
    async login(payload) {
      const data = await loginRequest(payload)
      this.token = data.token
      this.userInfo = data.userInfo
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.userInfo))
      return data
    },

    /**
     * 退出登录：清空状态与本地缓存
     */
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }
})
