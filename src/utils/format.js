/**
 * 通用格式化工具
 */

/**
 * 价格格式化：整数不带小数，小数最多保留两位，并加千分位
 * 例：1450 -> "1,450"；35.5 -> "35.5"
 */
export function formatPrice(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '0'
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

/**
 * 相对时间：刚刚 / x 分钟前 / x 小时前 / x 天前，超过 7 天显示日期
 */
export function formatRelativeTime(input) {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return ''

  const diff = Math.max(0, Date.now() - date.getTime())
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`

  return formatDate(input)
}

/**
 * 日期格式化：2026年11月22日
 */
export function formatDate(input) {
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

/**
 * 折扣：原价 2499、售价 1450 -> "5.8 折"
 */
export function formatDiscount(price, originalPrice) {
  const current = Number(price)
  const original = Number(originalPrice)
  if (!(current > 0) || !(original > current)) return ''
  return `${((current / original) * 10).toFixed(1)} 折`
}
