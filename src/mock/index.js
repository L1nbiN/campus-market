/**
 * Mock 适配层
 * ------------------------------------------------------------------
 * 用纯前端的方式模拟后端接口：300ms 延迟、分页、筛选、排序、搜索、
 * 登录注册、收藏、发布。数据存在内存 + localStorage 中，刷新不丢。
 *
 * 所有方法返回 Promise，成功时 resolve 业务数据（与 axios 拦截器
 * 处理后的结构一致），失败时 reject Error，由 api 层的 mockRequest 统一提示。
 */

import { CATEGORIES, demoAccounts, seedProducts } from './data'
import {
  MOCK_FAVORITES_KEY,
  MOCK_PRODUCTS_KEY,
  MOCK_USERS_KEY,
  TOKEN_KEY,
  readJSON,
  writeJSON
} from '@/utils/storage'

const MOCK_DELAY = 300
const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 100

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 统一包装异步响应：先模拟网络延迟，再执行具体逻辑。
 */
async function respond(handler) {
  await sleep(MOCK_DELAY)
  return handler()
}

/* ------------------------------------------------------------------ */
/* 用户与登录态                                                        */
/* ------------------------------------------------------------------ */

function getUsers() {
  const storedUsers = readJSON(MOCK_USERS_KEY, [])
  // 演示账号优先，注册账号追加在后
  return [...demoAccounts, ...storedUsers]
}

function findUserById(userId) {
  return getUsers().find((user) => user.id === userId) || null
}

function stripPassword(user) {
  const safeUser = { ...user }
  delete safeUser.password
  return safeUser
}

/**
 * Mock token 格式：mock-token-{userId}-{timestamp}
 * 真实项目中 token 应由后端签发，这里仅用于关联收藏与当前用户。
 */
function getCurrentUserId() {
  const token = localStorage.getItem(TOKEN_KEY) || ''
  const matched = /^mock-token-(.+)-(\d+)$/.exec(token)
  return matched ? matched[1] : ''
}

function getCurrentUser() {
  const userId = getCurrentUserId()
  return userId ? findUserById(userId) : null
}

function requireLogin() {
  const user = getCurrentUser()
  if (!user) {
    throw new Error('登录状态已失效，请重新登录')
  }
  return user
}

/* ------------------------------------------------------------------ */
/* 商品数据                                                            */
/* ------------------------------------------------------------------ */

function getStoredProducts() {
  return readJSON(MOCK_PRODUCTS_KEY, [])
}

function getAllProducts() {
  // 用户新发布的商品排在种子数据之前
  return [...getStoredProducts(), ...seedProducts]
}

function persistStoredProduct(product) {
  const stored = getStoredProducts()
  const index = stored.findIndex((item) => item.id === product.id)
  if (index === -1) return
  stored[index] = product
  writeJSON(MOCK_PRODUCTS_KEY, stored)
}

/* ------------------------------------------------------------------ */
/* 收藏                                                                */
/* ------------------------------------------------------------------ */

function readFavorites(userId) {
  return readJSON(`${MOCK_FAVORITES_KEY}:${userId}`, [])
}

function writeFavorites(userId, ids) {
  return writeJSON(`${MOCK_FAVORITES_KEY}:${userId}`, ids)
}

/**
 * 给商品补充当前用户的收藏状态。
 * favorites 字段表示「其他人收藏数」，当前用户收藏后展示 +1，
 * 这样刷新页面后数字仍然稳定。
 */
function decorateProduct(product) {
  const userId = getCurrentUserId()
  const favorited = userId ? readFavorites(userId).includes(product.id) : false
  return {
    ...product,
    favorited,
    favorites: (Number(product.favorites) || 0) + (favorited ? 1 : 0)
  }
}

/* ------------------------------------------------------------------ */
/* 排序                                                                */
/* ------------------------------------------------------------------ */

function sortProducts(list, sort) {
  const byLatest = (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  const sorted = [...list]

  if (sort === 'price-asc') {
    sorted.sort((a, b) => a.price - b.price || byLatest(a, b))
  } else if (sort === 'price-desc') {
    sorted.sort((a, b) => b.price - a.price || byLatest(a, b))
  } else {
    sorted.sort(byLatest)
  }

  return sorted
}

/* ------------------------------------------------------------------ */
/* Mock API                                                            */
/* ------------------------------------------------------------------ */

export const mockApi = {
  /**
   * 商品列表：支持分类、关键词、排序、分页，以及个人中心按卖家筛选
   * @param {object} params { category, keyword, sort, page, pageSize, sellerId }
   * @returns {Promise<{ list: object[], total: number, page: number, pageSize: number }>}
   */
  async getProductList(params = {}) {
    return respond(() => {
      const category = params.category || '全部'
      const keyword = String(params.keyword || '').trim().toLowerCase()
      const sort = params.sort || 'latest'
      const page = Math.max(1, Number(params.page) || 1)
      const pageSize = Math.min(
        MAX_PAGE_SIZE,
        Math.max(1, Number(params.pageSize) || DEFAULT_PAGE_SIZE)
      )

      let list = getAllProducts()

      if (category && category !== '全部') {
        list = list.filter((product) => product.category === category)
      }

      if (keyword) {
        list = list.filter((product) =>
          [product.title, product.desc, product.seller?.name]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(keyword))
        )
      }

      if (params.sellerId) {
        list = list.filter((product) => product.seller?.id === params.sellerId)
      }

      const sorted = sortProducts(list, sort)
      const total = sorted.length
      const start = (page - 1) * pageSize
      const paged = sorted.slice(start, start + pageSize).map(decorateProduct)

      return { list: paged, total, page, pageSize }
    })
  },

  /**
   * 商品详情：每次读取浏览量 +1，收藏状态随当前用户变化
   */
  async getProductDetail(id) {
    return respond(() => {
      const product = getAllProducts().find((item) => item.id === id)
      if (!product) {
        throw new Error('商品不存在或已下架')
      }

      product.views = (Number(product.views) || 0) + 1
      persistStoredProduct(product)

      return decorateProduct(product)
    })
  },

  /**
   * 发布商品：要求登录，写入 localStorage 后刷新仍可看到
   */
  async publishProduct(data) {
    return respond(() => {
      const user = requireLogin()
      const title = String(data.title || '').trim()

      if (!title) throw new Error('请填写商品标题')
      if (!(Number(data.price) > 0)) throw new Error('请填写正确的商品价格')
      if (!CATEGORIES.includes(data.category)) throw new Error('请选择正确的商品分类')
      if (!data.cover) throw new Error('请上传商品图片')

      const product = {
        id: `p${Date.now()}`,
        title,
        price: Number(data.price),
        originalPrice: Number(data.originalPrice) || 0,
        category: data.category,
        condition: data.condition || '九成新',
        cover: data.cover,
        desc: String(data.desc || '').trim(),
        seller: {
          id: user.id,
          name: user.name,
          college: user.college,
          contact: user.contact || `微信 ${user.username}`,
          joinedAt: user.joinedAt
        },
        createdAt: new Date().toISOString(),
        views: 0,
        favorites: 0
      }

      const stored = getStoredProducts()
      stored.unshift(product)
      const saved = writeJSON(MOCK_PRODUCTS_KEY, stored)

      if (!saved) {
        throw new Error('本地存储空间不足，请删除部分图片后重试')
      }

      return decorateProduct(product)
    })
  },

  /**
   * 我的收藏：按收藏时间倒序返回商品
   */
  async getFavorites() {
    return respond(() => {
      const userId = getCurrentUserId()
      if (!userId) throw new Error('请先登录后查看收藏')

      const ids = readFavorites(userId)
      const productMap = new Map(getAllProducts().map((product) => [product.id, product]))

      return ids
        .slice()
        .reverse()
        .map((id) => productMap.get(id))
        .filter(Boolean)
        .map(decorateProduct)
    })
  },

  /**
   * 收藏 / 取消收藏
   */
  async toggleFavorite(id) {
    return respond(() => {
      const userId = getCurrentUserId()
      if (!userId) throw new Error('请先登录后再收藏商品')

      const product = getAllProducts().find((item) => item.id === id)
      if (!product) throw new Error('商品不存在或已下架')

      const favorites = readFavorites(userId)
      const index = favorites.indexOf(id)
      let favorited

      if (index > -1) {
        favorites.splice(index, 1)
        favorited = false
      } else {
        favorites.push(id)
        favorited = true
      }

      writeFavorites(userId, favorites)

      return {
        id,
        favorited,
        favorites: (Number(product.favorites) || 0) + (favorited ? 1 : 0)
      }
    })
  },

  /**
   * 登录：返回 token + 脱敏后的用户信息
   */
  async login({ username, password } = {}) {
    return respond(() => {
      const account = String(username || '').trim()
      const user = getUsers().find((item) => item.username === account)

      if (!user || user.password !== password) {
        throw new Error('用户名或密码不正确')
      }

      return {
        token: `mock-token-${user.id}-${Date.now()}`,
        userInfo: stripPassword(user)
      }
    })
  },

  /**
   * 注册：账号写入 localStorage，注册成功后由前端调用登录
   */
  async register({ username, password, name, college } = {}) {
    return respond(() => {
      const account = String(username || '').trim()

      if (!/^[a-zA-Z0-9_]{3,20}$/.test(account)) {
        throw new Error('用户名需为 3-20 位字母、数字或下划线')
      }
      if (!name || !String(name).trim()) throw new Error('请填写昵称')
      if (!password || String(password).length < 6) throw new Error('密码至少 6 位')

      if (getUsers().some((item) => item.username === account)) {
        throw new Error('该用户名已被注册')
      }

      const user = {
        id: `u${Date.now()}`,
        username: account,
        password: String(password),
        name: String(name).trim(),
        college: String(college || '').trim() || '在校学生',
        contact: `微信 ${account}`,
        joinedAt: new Date().toISOString().slice(0, 10)
      }

      const stored = readJSON(MOCK_USERS_KEY, [])
      stored.push(user)
      const saved = writeJSON(MOCK_USERS_KEY, stored)

      if (!saved) {
        throw new Error('本地存储空间不足，无法完成注册')
      }

      return { userInfo: stripPassword(user) }
    })
  }
}
