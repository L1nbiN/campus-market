<script setup>
import { h, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  ChatDotRound,
  Clock,
  Star,
  StarFilled,
  User,
  View
} from '@element-plus/icons-vue'
import { getProductDetail, toggleFavorite } from '@/api/product'
import { useUserStore } from '@/stores/user'
import { formatDate, formatDiscount, formatPrice, formatRelativeTime } from '@/utils/format'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const product = ref(null)
const loading = ref(true)
const notFound = ref(false)
const favoriteLoading = ref(false)

async function loadDetail(id) {
  loading.value = true
  notFound.value = false
  product.value = null

  try {
    product.value = await getProductDetail(id)
  } catch {
    // 错误提示由 api 层统一处理
    notFound.value = true
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.id,
  (id) => {
    if (id) loadDetail(id)
  },
  { immediate: true }
)

function requireLoginTip(action = '继续操作') {
  ElMessage.warning(`登录后才能${action}`)
  router.push({
    path: '/login',
    query: { redirect: route.fullPath }
  })
}

async function handleFavorite() {
  if (!userStore.isLoggedIn) {
    requireLoginTip('收藏商品')
    return
  }

  favoriteLoading.value = true
  try {
    const result = await toggleFavorite(product.value.id)
    product.value.favorited = result.favorited
    product.value.favorites = result.favorites
    ElMessage.success(result.favorited ? '已加入收藏' : '已取消收藏')
  } catch {
    // 错误提示由 api 层统一处理
  } finally {
    favoriteLoading.value = false
  }
}

async function handleContact() {
  if (!userStore.isLoggedIn) {
    requireLoginTip('查看卖家联系方式')
    return
  }

  const seller = product.value?.seller || {}

  try {
    await ElMessageBox.alert(
      h(
        'div',
        { style: 'line-height: 1.9; font-size: 13px; color: #5a6478;' },
        [
          h('p', `卖家：${seller.name || '匿名同学'}`),
          h('p', `学院：${seller.college || '未填写'}`),
          h('p', `联系方式：${seller.contact || '暂未留下联系方式'}`),
          h(
            'p',
            { style: 'margin-top: 10px; padding-top: 10px; border-top: 1px dashed #e7ebf3; color: #8b94a7; font-size: 12px;' },
            '建议在校内公共区域当面交易，验货后再付款。'
          )
        ]
      ),
      '联系卖家',
      { confirmButtonText: '知道了' }
    )
  } catch {
    // 用户关闭弹窗
  }
}

function goBack() {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push('/list')
  }
}
</script>

<template>
  <div class="container page detail-page">
    <div class="detail-topbar">
      <button type="button" class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </button>

      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/list' }">全部商品</el-breadcrumb-item>
        <el-breadcrumb-item>{{ product?.category || '商品详情' }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 加载骨架 -->
    <div v-if="loading" class="detail-card detail-card--skeleton">
      <div class="detail-skeleton__media detail-shimmer"></div>
      <div class="detail-skeleton__info">
        <div class="detail-skeleton__line detail-skeleton__line--tag detail-shimmer"></div>
        <div class="detail-skeleton__line detail-skeleton__line--title detail-shimmer"></div>
        <div class="detail-skeleton__line detail-skeleton__line--title short detail-shimmer"></div>
        <div class="detail-skeleton__line detail-skeleton__line--price detail-shimmer"></div>
        <div class="detail-skeleton__line detail-shimmer"></div>
        <div class="detail-skeleton__line short detail-shimmer"></div>
        <div class="detail-skeleton__line detail-skeleton__line--block detail-shimmer"></div>
      </div>
    </div>

    <EmptyState
      v-else-if="notFound"
      title="商品不存在或已下架"
      description="它可能被卖家下架了，去列表看看其他校园好物吧。"
      action-text="回到商品列表"
      @action="router.push('/list')"
    />

    <div v-else-if="product" class="detail-card">
      <!-- 商品大图 -->
      <div class="detail-gallery">
        <div class="detail-gallery__frame">
          <img :src="product.cover" :alt="product.title" />
          <span class="detail-gallery__condition">{{ product.condition }}</span>
        </div>
        <p class="detail-gallery__hint">
          <el-icon><View /></el-icon>
          已有 {{ product.views }} 位同学浏览过
        </p>
      </div>

      <!-- 商品信息 -->
      <div class="detail-info">
        <div class="detail-tags">
          <span class="tag tag--category">{{ product.category }}</span>
          <span class="tag tag--condition">{{ product.condition }}</span>
          <span v-if="product.originalPrice > product.price" class="tag tag--discount">
            {{ formatDiscount(product.price, product.originalPrice) }}
          </span>
        </div>

        <h1 class="detail-title">{{ product.title }}</h1>

        <div class="detail-price">
          <span class="detail-price__current"><em>¥</em>{{ formatPrice(product.price) }}</span>
          <span v-if="product.originalPrice > product.price" class="detail-price__original">
            原价 ¥{{ formatPrice(product.originalPrice) }}
          </span>
        </div>

        <div class="detail-meta">
          <span><el-icon><View /></el-icon>{{ product.views }} 次浏览</span>
          <span><el-icon><Star /></el-icon>{{ product.favorites }} 人收藏</span>
          <span><el-icon><Clock /></el-icon>{{ formatRelativeTime(product.createdAt) }}发布</span>
        </div>

        <div class="detail-actions">
          <el-button
            size="large"
            class="favorite-btn"
            :class="{ 'is-favorited': product.favorited }"
            :loading="favoriteLoading"
            @click="handleFavorite"
          >
            <el-icon>
              <StarFilled v-if="product.favorited" />
              <Star v-else />
            </el-icon>
            {{ product.favorited ? '已收藏' : '收藏商品' }}
          </el-button>

          <el-button type="primary" size="large" class="contact-btn" @click="handleContact">
            <el-icon><ChatDotRound /></el-icon>
            联系卖家
          </el-button>
        </div>

        <div class="detail-section">
          <h2>商品描述</h2>
          <p class="detail-desc">{{ product.desc || '卖家还没有填写商品描述。' }}</p>
        </div>

        <!-- 卖家信息 -->
        <div class="seller-card">
          <div class="seller-card__head">
            <span class="seller-avatar">{{ (product.seller?.name || '同').slice(0, 1) }}</span>
            <div class="seller-base">
              <strong>{{ product.seller?.name || '匿名同学' }}</strong>
              <small>{{ product.seller?.college }}</small>
            </div>
            <span class="seller-badge">
              <el-icon><User /></el-icon>
              校园卖家
            </span>
          </div>

          <dl class="seller-info">
            <div>
              <dt>联系方式</dt>
              <dd>{{ product.seller?.contact || '暂未留下联系方式' }}</dd>
            </div>
            <div>
              <dt>加入时间</dt>
              <dd>{{ formatDate(product.seller?.joinedAt) || '—' }}</dd>
            </div>
          </dl>

          <p class="seller-tip">平台建议：在校内公共区域当面交易，验货后再付款。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  padding-top: 24px;
}

.detail-topbar {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--cm-border);
  border-radius: 8px;
  background: #fff;
  color: var(--cm-text-secondary);
  font-size: 12px;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.back-btn:hover {
  border-color: var(--cm-primary);
  color: var(--cm-primary);
}

.detail-card {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: 40px;
  padding: 28px;
  border: 1px solid var(--cm-border);
  border-radius: 16px;
  background: var(--cm-surface);
  box-shadow: var(--cm-shadow-xs);
}

.detail-gallery {
  align-self: start;
}

.detail-gallery__frame {
  position: relative;
  overflow: hidden;
  border-radius: var(--cm-radius);
  background: #eef2f8;
}

.detail-gallery__frame img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.detail-gallery__condition {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 4px 11px;
  border-radius: 999px;
  background: rgba(24, 34, 52, 0.62);
  color: #fff;
  font-size: 11px;
  backdrop-filter: blur(4px);
}

.detail-gallery__hint {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  color: var(--cm-text-muted);
  font-size: 12px;
}

.detail-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.tag--category {
  background: var(--cm-primary-soft);
  color: var(--cm-primary);
}

.tag--condition {
  background: #e9f8f1;
  color: var(--cm-success);
}

.tag--discount {
  background: #fff3ee;
  color: var(--cm-price);
}

.detail-title {
  margin-top: 14px;
  font-size: 25px;
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: -0.3px;
}

.detail-price {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 12px;
  background: linear-gradient(90deg, #fff6f2 0%, #fffaf8 100%);
}

.detail-price__current {
  color: var(--cm-price);
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.detail-price__current em {
  margin-right: 2px;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
}

.detail-price__original {
  color: var(--cm-text-muted);
  font-size: 13px;
  text-decoration: line-through;
}

.detail-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 14px;
  color: var(--cm-text-muted);
  font-size: 12px;
}

.detail-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.detail-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.detail-actions .el-button {
  margin-left: 0;
  min-width: 132px;
}

.favorite-btn.is-favorited {
  border-color: rgba(240, 91, 60, 0.35);
  background: #fff5f2;
  color: var(--cm-price);
}

.contact-btn {
  flex: 1;
}

.detail-section {
  margin-top: 26px;
  padding-top: 22px;
  border-top: 1px solid #f1f4f9;
}

.detail-section h2 {
  font-size: 15px;
  font-weight: 600;
}

.detail-desc {
  margin-top: 10px;
  color: var(--cm-text-secondary);
  font-size: 13.5px;
  line-height: 1.9;
  white-space: pre-line;
  word-break: break-word;
}

/* ---------- 卖家卡片 ---------- */
.seller-card {
  margin-top: 24px;
  padding: 18px;
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius);
  background: var(--cm-bg);
}

.seller-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.seller-avatar {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex: none;
  border-radius: 50%;
  background: var(--cm-primary-soft);
  color: var(--cm-primary);
  font-size: 18px;
  font-weight: 700;
}

.seller-base {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.seller-base strong {
  font-size: 14px;
}

.seller-base small {
  margin-top: 2px;
  color: var(--cm-text-muted);
  font-size: 12px;
}

.seller-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 5px;
  background: #fff;
  color: var(--cm-primary);
  font-size: 10px;
}

.seller-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 14px 0 0;
  padding-top: 14px;
  border-top: 1px solid var(--cm-border);
}

.seller-info div {
  min-width: 0;
}

.seller-info dt {
  color: var(--cm-text-muted);
  font-size: 11px;
}

.seller-info dd {
  margin: 2px 0 0;
  overflow: hidden;
  color: var(--cm-text-secondary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seller-tip {
  margin-top: 12px;
  color: var(--cm-text-muted);
  font-size: 11px;
  line-height: 1.7;
}

/* ---------- 骨架 ---------- */
.detail-card--skeleton {
  align-items: start;
}

.detail-skeleton__media {
  aspect-ratio: 4 / 3;
  border-radius: var(--cm-radius);
}

.detail-skeleton__info {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 8px;
}

.detail-skeleton__line {
  width: 100%;
  height: 14px;
  border-radius: 6px;
}

.detail-skeleton__line.short {
  width: 62%;
}

.detail-skeleton__line--tag {
  width: 32%;
  height: 22px;
}

.detail-skeleton__line--title {
  height: 28px;
}

.detail-skeleton__line--price {
  width: 44%;
  height: 46px;
  margin-top: 8px;
}

.detail-skeleton__line--block {
  height: 120px;
  margin-top: 12px;
}

.detail-shimmer {
  background: linear-gradient(90deg, #eef2f8 25%, #f7f9fc 37%, #eef2f8 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@media (max-width: 900px) {
  .detail-card {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 20px;
  }

  .detail-title {
    font-size: 22px;
  }

  .detail-price__current {
    font-size: 30px;
  }
}

@media (max-width: 600px) {
  .detail-page {
    padding-top: 18px;
  }

  .detail-topbar {
    gap: 12px;
  }

  .detail-topbar :deep(.el-breadcrumb) {
    font-size: 12px;
  }

  .detail-card {
    padding: 16px;
  }

  .detail-actions {
    flex-direction: column;
  }

  .detail-actions .el-button {
    width: 100%;
  }

  .seller-info {
    grid-template-columns: 1fr;
  }
}
</style>
