<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight, Plus, Star, SwitchButton, View } from '@element-plus/icons-vue'
import { getFavorites, getProductList } from '@/api/product'
import { useUserStore } from '@/stores/user'
import { formatDate, formatPrice, formatRelativeTime } from '@/utils/format'
import PageTitle from '@/components/PageTitle.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const userStore = useUserStore()

const myProducts = ref([])
const favorites = ref([])
const loading = ref(true)
const loadError = ref(false)

const profile = computed(() => userStore.userInfo || {})
const avatarText = computed(() => (profile.value.name || profile.value.username || '同').slice(0, 1))
const joinedAtText = computed(() => formatDate(profile.value.joinedAt) || '—')
const totalViews = computed(() =>
  myProducts.value.reduce((total, product) => total + (Number(product.views) || 0), 0)
)

async function loadProfileData() {
  if (!profile.value.id) {
    loading.value = false
    return
  }

  loading.value = true
  loadError.value = false

  try {
    const [productResult, favoriteResult] = await Promise.all([
      getProductList({ sellerId: profile.value.id, page: 1, pageSize: 100 }),
      getFavorites()
    ])
    myProducts.value = productResult.list
    favorites.value = favoriteResult
  } catch {
    // 错误提示由 api 层统一处理
    loadError.value = true
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('退出后需要重新登录才能发布商品或查看收藏。', '确定退出登录吗？', {
      confirmButtonText: '退出登录',
      cancelButtonText: '再想想',
      type: 'warning'
    })
  } catch {
    return
  }

  userStore.logout()
  ElMessage.success('已退出登录')
  router.replace('/')
}

onMounted(loadProfileData)
</script>

<template>
  <div class="container page profile-page">
    <PageTitle title="个人中心" subtitle="管理你的闲置发布与收藏，查看交易数据" />

    <!-- 用户信息卡 -->
    <section class="profile-card">
      <div class="profile-main">
        <span class="profile-avatar">{{ avatarText }}</span>
        <div class="profile-info">
          <div class="profile-name-row">
            <h2>{{ profile.name || '同学' }}</h2>
            <span class="profile-badge">校园卖家</span>
          </div>
          <p class="profile-meta">
            @{{ profile.username }}
            <span class="dot">·</span>
            {{ profile.college || '未填写学院' }}
          </p>
          <p class="profile-joined">加入校园集市于 {{ joinedAtText }}</p>
        </div>
      </div>

      <div class="profile-actions">
        <el-button type="primary" @click="router.push('/publish')">
          <el-icon><Plus /></el-icon>
          发布闲置
        </el-button>
        <el-button @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>

      <div class="profile-stats">
        <div class="stat">
          <strong>{{ myProducts.length }}</strong>
          <span>我的发布</span>
        </div>
        <div class="stat">
          <strong>{{ favorites.length }}</strong>
          <span>我的收藏</span>
        </div>
        <div class="stat">
          <strong>{{ totalViews }}</strong>
          <span>累计浏览</span>
        </div>
        <p class="profile-stats__tip">交易请尽量选择校内公共区域，当面验货更安心。</p>
      </div>
    </section>

    <div class="profile-layout">
      <!-- 我的发布 -->
      <section class="panel">
        <div class="panel-head">
          <div>
            <h2>我的发布</h2>
            <p>你正在出售的校园闲置</p>
          </div>
          <el-button text class="panel-link" @click="router.push('/publish')">
            发布新闲置
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>

        <div v-if="loading" class="row-skeleton">
          <div v-for="index in 3" :key="index" class="row-skeleton__item">
            <div class="row-skeleton__cover skeleton-shimmer"></div>
            <div class="row-skeleton__lines">
              <div class="row-skeleton__line skeleton-shimmer"></div>
              <div class="row-skeleton__line row-skeleton__line--short skeleton-shimmer"></div>
            </div>
          </div>
        </div>

        <EmptyState
          v-else-if="loadError"
          title="数据加载失败"
          description="请稍后重试，或刷新页面重新加载。"
          action-text="重新加载"
          @action="loadProfileData"
        />

        <EmptyState
          v-else-if="!myProducts.length"
          title="你还没有发布闲置"
          description="拍张照片、写段描述，三分钟就能发布第一件闲置。"
          action-text="去发布第一件闲置"
          @action="router.push('/publish')"
        />

        <ul v-else class="product-rows">
          <li v-for="product in myProducts" :key="product.id">
            <RouterLink :to="`/detail/${product.id}`" class="product-row">
              <img :src="product.cover" :alt="product.title" loading="lazy" />
              <div class="product-row__main">
                <strong>{{ product.title }}</strong>
                <span>{{ product.category }} · {{ formatRelativeTime(product.createdAt) }}发布</span>
              </div>
              <div class="product-row__price">¥{{ formatPrice(product.price) }}</div>
              <div class="product-row__meta">
                <span><el-icon><View /></el-icon>{{ product.views }}</span>
                <span><el-icon><Star /></el-icon>{{ product.favorites }}</span>
              </div>
              <el-icon class="product-row__arrow"><ArrowRight /></el-icon>
            </RouterLink>
          </li>
        </ul>
      </section>

      <!-- 侧栏 -->
      <aside class="profile-aside">
        <button type="button" class="side-entry" @click="router.push('/favorites')">
          <span class="side-entry__icon side-entry__icon--warm">
            <el-icon :size="19"><Star /></el-icon>
          </span>
          <span class="side-entry__text">
            <strong>我的收藏</strong>
            <small>{{ favorites.length }} 件好物已收藏</small>
          </span>
          <el-icon class="side-entry__arrow"><ArrowRight /></el-icon>
        </button>

        <button type="button" class="side-entry" @click="router.push('/publish')">
          <span class="side-entry__icon">
            <el-icon :size="19"><Plus /></el-icon>
          </span>
          <span class="side-entry__text">
            <strong>发布新闲置</strong>
            <small>三分钟让它遇见新主人</small>
          </span>
          <el-icon class="side-entry__arrow"><ArrowRight /></el-icon>
        </button>

        <div class="side-tips">
          <h3>安全交易提醒</h3>
          <ul>
            <li>优先选择校内公共区域当面交易</li>
            <li>验货确认无误后再付款</li>
            <li>不要向陌生人转账或提供验证码</li>
            <li>遇到可疑情况及时联系学校保卫处</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 1120px;
}

/* ---------- 用户信息卡 ---------- */
.profile-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 22px 24px;
  padding: 28px;
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius-lg);
  background:
    radial-gradient(circle at 96% 0%, rgba(47, 111, 237, 0.08), transparent 38%),
    var(--cm-surface);
  box-shadow: var(--cm-shadow-xs);
}

.profile-main {
  display: flex;
  align-items: center;
  gap: 18px;
}

.profile-avatar {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  flex: none;
  border-radius: 50%;
  background: var(--cm-primary-soft);
  color: var(--cm-primary);
  font-size: 28px;
  font-weight: 700;
}

.profile-info {
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 9px;
}

.profile-name-row h2 {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.profile-badge {
  padding: 2px 8px;
  border-radius: 5px;
  background: var(--cm-primary-soft);
  color: var(--cm-primary);
  font-size: 10px;
  font-weight: 500;
}

.profile-meta {
  margin-top: 5px;
  color: var(--cm-text-secondary);
  font-size: 13px;
}

.profile-meta .dot {
  margin: 0 5px;
  color: var(--cm-border-strong);
}

.profile-joined {
  margin-top: 3px;
  color: var(--cm-text-muted);
  font-size: 12px;
}

.profile-actions {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.profile-actions .el-button {
  margin-left: 0;
}

.profile-stats {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(0, 2fr);
  align-items: center;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid var(--cm-border);
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat strong {
  color: var(--cm-text);
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.stat span {
  margin-top: 2px;
  color: var(--cm-text-muted);
  font-size: 12px;
}

.profile-stats__tip {
  justify-self: end;
  max-width: 280px;
  color: var(--cm-text-muted);
  font-size: 11px;
  line-height: 1.7;
  text-align: right;
}

/* ---------- 内容布局 ---------- */
.profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  align-items: start;
  gap: 24px;
  margin-top: 24px;
}

.panel {
  padding: 22px;
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius);
  background: var(--cm-surface);
  box-shadow: var(--cm-shadow-xs);
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.panel-head h2 {
  font-size: 17px;
  font-weight: 700;
}

.panel-head p {
  margin-top: 2px;
  color: var(--cm-text-muted);
  font-size: 12px;
}

.panel-link {
  color: var(--cm-primary);
  font-size: 12px;
}

.product-rows {
  display: flex;
  flex-direction: column;
}

.product-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 6px;
  border-bottom: 1px solid #f1f4f9;
  transition: background 0.2s ease;
}

.product-rows li:last-child .product-row {
  border-bottom: 0;
}

.product-row:hover {
  background: var(--cm-primary-soft-2);
}

.product-row img {
  width: 84px;
  height: 62px;
  flex: none;
  border-radius: 8px;
  object-fit: cover;
  background: #eef2f8;
}

.product-row__main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.product-row__main strong {
  overflow: hidden;
  color: var(--cm-text);
  font-size: 13.5px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-row__main span {
  margin-top: 4px;
  color: var(--cm-text-muted);
  font-size: 11px;
}

.product-row__price {
  flex: none;
  color: var(--cm-price);
  font-size: 16px;
  font-weight: 700;
}

.product-row__meta {
  display: flex;
  gap: 12px;
  flex: none;
  color: var(--cm-text-muted);
  font-size: 11px;
}

.product-row__meta span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.product-row__arrow {
  flex: none;
  color: var(--cm-border-strong);
  font-size: 13px;
}

/* ---------- 侧栏 ---------- */
.profile-aside {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.side-entry {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius);
  background: var(--cm-surface);
  text-align: left;
  box-shadow: var(--cm-shadow-xs);
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.side-entry:hover {
  transform: translateY(-2px);
  border-color: rgba(47, 111, 237, 0.3);
  box-shadow: var(--cm-shadow);
}

.side-entry__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: 10px;
  background: var(--cm-primary-soft);
  color: var(--cm-primary);
}

.side-entry__icon--warm {
  background: #fff3ee;
  color: var(--cm-price);
}

.side-entry__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.side-entry__text strong {
  font-size: 13.5px;
  font-weight: 600;
}

.side-entry__text small {
  margin-top: 2px;
  overflow: hidden;
  color: var(--cm-text-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.side-entry__arrow {
  flex: none;
  color: var(--cm-border-strong);
  font-size: 13px;
}

.side-tips {
  padding: 18px;
  border-radius: var(--cm-radius);
  background: #fbfcfe;
  border: 1px dashed var(--cm-border-strong);
}

.side-tips h3 {
  font-size: 13px;
  font-weight: 600;
}

.side-tips ul {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.side-tips li {
  position: relative;
  padding-left: 12px;
  color: var(--cm-text-muted);
  font-size: 11.5px;
  line-height: 1.7;
}

.side-tips li::before {
  position: absolute;
  top: 8px;
  left: 0;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--cm-border-strong);
  content: '';
}

/* ---------- 骨架 ---------- */
.row-skeleton {
  display: flex;
  flex-direction: column;
}

.row-skeleton__item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid #f1f4f9;
}

.row-skeleton__cover {
  width: 84px;
  height: 62px;
  flex: none;
  border-radius: 8px;
}

.row-skeleton__lines {
  flex: 1;
}

.row-skeleton__line {
  width: 74%;
  height: 12px;
  border-radius: 6px;
}

.row-skeleton__line--short {
  width: 42%;
  margin-top: 9px;
  height: 10px;
}

.skeleton-shimmer {
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

@media (max-width: 960px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .profile-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .profile-stats__tip {
    display: none;
  }
}

@media (max-width: 700px) {
  .profile-card {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .profile-actions {
    flex-wrap: wrap;
  }

  .profile-actions .el-button {
    flex: 1;
  }

  .profile-avatar {
    width: 58px;
    height: 58px;
    font-size: 22px;
  }

  .profile-name-row h2 {
    font-size: 19px;
  }

  .product-row {
    flex-wrap: wrap;
    gap: 10px;
  }

  .product-row__meta {
    display: none;
  }

  .product-row img {
    width: 70px;
    height: 54px;
  }

  .product-row__price {
    font-size: 15px;
  }

  .product-row__arrow {
    display: none;
  }
}
</style>
