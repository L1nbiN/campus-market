import request, { mockRequest } from './request'
import { mockApi } from '@/mock'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

/**
 * 登录
 * @param {{ username: string, password: string }} data
 * @returns {Promise<{ token: string, userInfo: object }>}
 */
export function login(data) {
  if (USE_MOCK) return mockRequest(mockApi.login(data))
  return request.post('/auth/login', data)
}

/**
 * 注册
 * @param {{ username: string, password: string, name: string, college: string }} data
 */
export function register(data) {
  if (USE_MOCK) return mockRequest(mockApi.register(data))
  return request.post('/auth/register', data)
}
