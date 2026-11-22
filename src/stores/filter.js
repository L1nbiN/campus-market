import { defineStore } from 'pinia'

export const SORT_OPTIONS = [
  { label: '最新发布', value: 'latest' },
  { label: '价格从低到高', value: 'price-asc' },
  { label: '价格从高到低', value: 'price-desc' }
]

export const DEFAULT_QUERY = {
  category: '全部',
  keyword: '',
  sort: 'latest',
  page: 1,
  pageSize: 12
}

// 这些字段变化时应该回到第 1 页
const RESET_PAGE_KEYS = ['category', 'keyword', 'sort', 'pageSize']

/**
 * 列表筛选条件统一收敛到 filter store。
 * 首页分类入口、顶部搜索、列表页筛选与分页都只操作这一个 query，
 * 避免各页面各自拼参数、状态不同步。
 */
export const useFilterStore = defineStore('filter', {
  state: () => ({
    query: { ...DEFAULT_QUERY }
  }),

  getters: {
    activeFilterCount: (state) => {
      let count = 0
      if (state.query.category !== DEFAULT_QUERY.category) count += 1
      if (state.query.keyword) count += 1
      if (state.query.sort !== DEFAULT_QUERY.sort) count += 1
      return count
    }
  },

  actions: {
    /**
     * 合并筛选条件。
     * 除「只翻页」以外，只要筛选字段发生变化就自动重置到第 1 页；
     * 如果调用方显式传了 page，则尊重传入值。
     */
    setFilter(patch = {}) {
      if (!patch || typeof patch !== 'object') return

      const next = { ...this.query, ...patch }
      const filterChanged = RESET_PAGE_KEYS.some((key) =>
        Object.prototype.hasOwnProperty.call(patch, key)
      )

      if (filterChanged && !Object.prototype.hasOwnProperty.call(patch, 'page')) {
        next.page = 1
      }

      this.query = next
    },

    resetFilter() {
      this.query = { ...DEFAULT_QUERY }
    }
  }
})
