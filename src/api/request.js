import axios from 'axios'
import { ElMessage } from 'element-plus'
import { TOKEN_KEY, USER_KEY } from '@/utils/storage'

/**
 * Axios 实例
 * baseURL 优先读取环境变量，未配置时使用 /api
 */
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 10000
})

/**
 * 请求拦截：自动注入登录 token
 */
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * 响应拦截：统一处理业务错误与 HTTP 错误
 * - 约定后端成功响应为 { code: 0 | 200, data, message }
 * - 非约定结构则直接返回 response.data
 */
request.interceptors.response.use(
  (response) => {
    const body = response.data

    if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'code')) {
      if (body.code === 0 || body.code === 200) {
        return body.data
      }
      const message = body.message || '请求失败，请稍后重试'
      ElMessage.error(message)
      return Promise.reject(new Error(message))
    }

    return body
  },
  (error) => {
    const status = error.response?.status
    let message = '网络异常，请检查网络后重试'

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      message = '登录状态已失效，请重新登录'
    } else if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (status) {
      message = `请求失败（${status}）`
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时，请稍后重试'
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

/**
 * Mock 请求统一错误处理
 * Mock 不经过 axios 拦截器，这里补上同样的 ElMessage 提示，
 * 保证「真实接口 / Mock」两种模式下页面的错误体验一致。
 */
export function mockRequest(promise) {
  return promise.catch((error) => {
    ElMessage.error(error?.message || '操作失败，请稍后重试')
    return Promise.reject(error)
  })
}

export default request
