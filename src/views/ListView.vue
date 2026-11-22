<script setup>
import { computed, onActivated, onDeactivated, onMounted, ref, watch } from 'vue'
import { Loading, RefreshLeft, Search } from '@element-plus/icons-vue'
import { getProductList } from '@/api/product'
import { SORT_OPTIONS, useFilterStore } from '@/stores/filter'
import ProductCard from '@/components/ProductCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageTitle from '@/components/PageTitle.vue'

defineOptions({ name: 'ListView' })

const filterStore = useFilterStore()

const categoryOptions = ['全部', '教材书籍', '数码电子', '生活用品', '运动器材', '服饰鞋包', '其他']

const list = ref([])
const total = ref(0)
const loading = ref(true)
const refreshing = ref(false)
const loadError = ref(false)
const initialized = ref(false)
const active = ref(false)
const keywordInput = ref(filterStore.query.keyword)

// 请求令牌：快速切换筛选条件时，丢弃过期响应
let requestToken = 0

const query = computed(() => filterStore.query)
const hasFilter = computed(
  () =>
    query.value.category !== '全部' ||
    Boolean(query.value.keyword) ||
    query.value.sort !== 'latest' ||
    query.value.page > 1
)

async function loadList({ silent = false } = {}) {
  const token = ++requestToken
  loadError.value = false

  if (silent) {
    refreshing.value = true
  } else {
    loading.value = true
  }

  try {
    const data = await getProductList({ ...query.value })
    if (token !== requestToken) return
    list.value = data.list
    total.value = data.total
  } catch {
    if (token !== requestToken) return
    loadError.value = true
    if (!silent) {
      list.value = []
      total.value = 0
    }
  } finally {
    if (token === requestToken) {
      loading.value = false
      refreshing.value = false
      initialized.value = true
    }
  }
}

watch(
  () => filterStore.query,
  () => {
    if (active.value) loadList()
  }
)

// header 搜索或重置 filter 时，同步输入框
watch(
  () => filterStore.query.keyword,
  (value) => {
    keywordInput.value = value
  }
)

onMounted(() => loadList())

// keep-alive 缓存后重新进入：保留筛选与分页，仅静默刷新数据
onActivated(() => {
  active.value = true
  if (initialized.value) {
    loadList({ silent: true })
  }
})

onDeactivated(() => {
  active.value = false
})

function selectCategory(category) {
  filterStore.setFilter({ category })
}

function changeSort(sort) {
  filterStore.setFilter({ sort })
}

function applySearch() {
  filterStore.setFilter({ keyword: keywordInput.value.trim() })
}

function resetAll() {
  filterStore.resetFilter()
  keywordInput.value = ''
}

function handlePageChange(page) {
  filterStore.setFilter({ page })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="container page list-page">
    <PageTitle
      title="全部商品"
      subtitle="发现同学们正在转手的闲置好物，支持分类筛选、关键词搜索与价格排序"
    />

    <!-- 筛选面板 -->
    <section class="filter-panel">
      <div class="filter-row">
        <span class="filter-label">分类</span>
        <div class="chip-list">
          <button
            v-for="category in categoryOptions"
            :key="category"
            type="button"
            class="chip"
            :class="{ 'is-active': query.category === category }"
            @click="selectCategory(category)"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <div class="filter-row filter-row--controls">
        <div class="search-box">
          <el-input
            v-model="keywordInput"
            size="large"
            placeholder="搜索标题、描述或卖家"
            clearable
            :prefix-icon="Search"
            @keyup.enter="applySearch"
            @clear="applySearch"
          />
          <el-button type="primary" size="large" @click="applySearch">搜索</el-button>
        </div>

        <div class="sort-box">
          <span class="filter-label">排序</span>
          <div class="sort-group">
            <button
              v-for="option in SORT_OPTIONS"
              :key="option.value"
              type="button"
              :class="{ 'is-active': query.sort === option.value }"
              @click="changeSort(option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <el-button text class="reset-btn" :disabled="!hasFilter" @click="resetAll">
          <el-icon><RefreshLeft /></el-icon>
          重置
        </el-button>
      </div>
    </section>

    <!-- 结果统计 -->
    <div class="result-bar">
      <div class="result-bar__summary">
        共 <strong>{{ total }}</strong> 件商品
        <span v-if="query.category !== '全部'" class="result-tag">{{ query.category }}</span>
        <span v-if="query.keyword" class="result-tag">关键词「{{ query.keyword }}」</span>
      </div>
      <span v-if="refreshing" class="refreshing">
        <el-icon class="is-loading"><Loading /></el-icon>
        正在更新
      </span>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading" class="product-grid">
      <SkeletonCard v-for="index in 8" :key="index" />
    </div>

    <EmptyState
      v-else-if="loadError"
      title="商品加载失败"
      description="网络好像开小差了，请稍后重试。"
      action-text="重新加载"
      @action="loadList"
    />

    <template v-else-if="list.length">
      <div class="product-grid">
        <ProductCard v-for="product in list" :key="product.id" :product="product" />
      </div>

      <div v-if="total > query.pageSize" class="pagination-bar">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="query.pageSize"
          :current-page="query.page"
          hide-on-single-page
          @current-change="handlePageChange"
        />
        <span class="page-hint">
          第 {{ query.page }} / {{ Math.ceil(total / query.pageSize) }} 页
        </span>
      </div>
    </template>

    <EmptyState
      v-else
      title="没有找到相关商品"
      :description="
        query.keyword
          ? `没有找到与「${query.keyword}」相关的闲置，换个关键词试试吧。`
          : '当前筛选条件下还没有商品，去其他分类逛逛吧。'
      "
      action-text="清空筛选条件"
      @action="resetAll"
    />
  </div>
</template>

<style scoped>
.list-page {
  padding-top: 32px;
}

/* ---------- 筛选面板 ---------- */
.filter-panel {
  padding: 20px 22px;
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius);
  background: var(--cm-surface);
  box-shadow: var(--cm-shadow-xs);
}

.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.filter-row + .filter-row {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid #f1f4f9;
}

.filter-label {
  flex: none;
  padding-top: 6px;
  color: var(--cm-text-muted);
  font-size: 12px;
  font-weight: 500;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  height: 32px;
  padding: 0 15px;
  border: 1px solid var(--cm-border);
  border-radius: 999px;
  background: #fff;
  color: var(--cm-text-secondary);
  font-size: 13px;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.chip:hover {
  border-color: var(--cm-primary);
  color: var(--cm-primary);
}

.chip.is-active {
  border-color: var(--cm-primary);
  background: var(--cm-primary-soft);
  color: var(--cm-primary);
  font-weight: 600;
}

.filter-row--controls {
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 18px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 260px;
  max-width: 440px;
}

.search-box .el-input {
  flex: 1;
}

.search-box .el-button {
  flex: none;
  margin-left: 0;
}

.sort-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-box .filter-label {
  padding-top: 0;
}

.sort-group {
  display: flex;
  padding: 3px;
  border-radius: 9px;
  background: var(--cm-bg);
}

.sort-group button {
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--cm-text-secondary);
  font-size: 12px;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.sort-group button:hover {
  color: var(--cm-primary);
}

.sort-group button.is-active {
  background: #fff;
  color: var(--cm-primary);
  font-weight: 600;
  box-shadow: var(--cm-shadow-xs);
}

.reset-btn {
  margin-left: auto;
  color: var(--cm-text-muted);
}

/* ---------- 结果栏 ---------- */
.result-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 2px 18px;
  color: var(--cm-text-muted);
  font-size: 13px;
}

.result-bar strong {
  color: var(--cm-text);
  font-size: 15px;
}

.result-tag {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 8px;
  border-radius: 5px;
  background: var(--cm-primary-soft);
  color: var(--cm-primary);
  font-size: 11px;
}

.refreshing {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--cm-primary);
  font-size: 12px;
}

/* ---------- 分页 ---------- */
.pagination-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 36px;
}

.page-hint {
  color: var(--cm-text-muted);
  font-size: 12px;
}

@media (max-width: 900px) {
  .reset-btn {
    margin-left: 0;
  }
}

@media (max-width: 640px) {
  .list-page {
    padding-top: 24px;
  }

  .filter-panel {
    padding: 16px;
  }

  .filter-row {
    gap: 10px;
  }

  .filter-row + .filter-row {
    margin-top: 14px;
    padding-top: 14px;
  }

  .chip {
    height: 30px;
    padding: 0 12px;
    font-size: 12px;
  }

  .search-box {
    min-width: 100%;
    max-width: none;
  }

  .sort-box {
    width: 100%;
  }

  .sort-group {
    flex: 1;
    overflow-x: auto;
  }

  .sort-group button {
    flex: 1;
  }

  .result-bar {
    padding: 16px 2px 14px;
  }

  .pagination-bar {
    margin-top: 28px;
  }
}
</style>
