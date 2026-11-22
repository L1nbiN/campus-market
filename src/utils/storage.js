/**
 * localStorage 键名与通用读写工具
 * 统一收敛，避免各个模块各自硬编码字符串。
 */

export const TOKEN_KEY = 'campus_market_token'
export const USER_KEY = 'campus_market_user'

// Mock 层专用（真实后端模式下不会写入）
export const MOCK_PRODUCTS_KEY = 'campus_market_mock_products'
export const MOCK_USERS_KEY = 'campus_market_mock_users'
export const MOCK_FAVORITES_KEY = 'campus_market_mock_favorites'

/**
 * 读取 JSON，解析失败时返回兜底值
 */
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.warn(`[storage] 读取 ${key} 失败`, error)
    return fallback
  }
}

/**
 * 写入 JSON。localStorage 可能因隐私模式或容量超限失败，
 * 这里返回布尔值由调用方决定是否提示，而不是直接抛错。
 */
export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.warn(`[storage] 写入 ${key} 失败`, error)
    return false
  }
}
