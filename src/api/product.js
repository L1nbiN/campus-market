import request, { mockRequest } from './request'
import { mockApi } from '@/mock'

/**
 * 是否使用 Mock 数据：
 * 默认 true；只有显式设置 VITE_USE_MOCK=false 时才走真实 axios。
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

/**
 * 商品列表
 * @param {object} params { category, keyword, sort, page, pageSize, sellerId? }
 */
export function getProductList(params = {}) {
  if (USE_MOCK) return mockRequest(mockApi.getProductList(params))
  return request.get('/products', { params })
}

/**
 * 商品详情
 */
export function getProductDetail(id) {
  if (USE_MOCK) return mockRequest(mockApi.getProductDetail(id))
  return request.get(`/products/${id}`)
}

/**
 * 发布商品
 */
export function publishProduct(data) {
  if (USE_MOCK) return mockRequest(mockApi.publishProduct(data))
  return request.post('/products', data)
}

/**
 * 我的收藏
 */
export function getFavorites() {
  if (USE_MOCK) return mockRequest(mockApi.getFavorites())
  return request.get('/favorites')
}

/**
 * 收藏 / 取消收藏
 */
export function toggleFavorite(id) {
  if (USE_MOCK) return mockRequest(mockApi.toggleFavorite(id))
  return request.post(`/favorites/${id}/toggle`)
}
