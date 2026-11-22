/**
 * 登录成功后的跳转地址只允许站内路径，避免开放重定向。
 */
export function sanitizeRedirect(value, fallback = '/') {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  if (value.startsWith('/login') || value.startsWith('/register')) return fallback
  return value
}
