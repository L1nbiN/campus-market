<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight,
  Basketball,
  Cellphone,
  CircleCheck,
  Grid,
  House,
  Reading,
  Search,
  ShoppingBag
} from '@element-plus/icons-vue'
import { getProductList } from '@/api/product'
import { useFilterStore } from '@/stores/filter'
import ProductCard from '@/components/ProductCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const filterStore = useFilterStore()

const latest = ref([])
const loading = ref(true)
const loadError = ref(false)
const keyword = ref('')

const categoryList = [
  { name: '教材书籍', en: 'Textbooks', icon: Reading, color: '#2F6FED', soft: '#EAF1FE' },
  { name: '数码电子', en: 'Digital', icon: Cellphone, color: '#7C5CFC', soft: '#F1EDFF' },
  { name: '生活用品', en: 'Lifestyle', icon: House, color: '#E0873A', soft: '#FFF4E8' },
  { name: '运动器材', en: 'Sports', icon: Basketball, color: '#1F9D6B', soft: '#E9F8F1' },
  { name: '服饰鞋包', en: 'Fashion', icon: ShoppingBag, color: '#D45B76', soft: '#FDEEF2' },
  { name: '其他', en: 'More', icon: Grid, color: '#4F7C8B', soft: '#EDF5F7' }
]

const trustItems = ['校内同学真实发布', '支持当面验货', '发布完全免费']

async function loadLatest() {
  loading.value = true
  loadError.value = false
  try {
    const data = await getProductList({ page: 1, pageSize: 8, sort: 'latest' })
    latest.value = data.list
  } catch {
    // 错误提示已由 api 层统一处理
    loadError.value = true
  } finally {
    loading.value = false
  }
}

function goCategory(category) {
  filterStore.setFilter({
    category,
    keyword: '',
    sort: 'latest',
    page: 1
  })
  router.push('/list')
}

function search(term) {
  const value = String(term ?? keyword.value).trim()
  keyword.value = value
  filterStore.setFilter({
    keyword: value,
    category: '全部',
    sort: 'latest',
    page: 1
  })
  router.push('/list')
}

onMounted(loadLatest)
</script>

<template>
  <div class="home">
    <!-- 顶部 Banner -->
    <section class="home-hero">
      <div class="container home-hero__inner">
        <div class="hero-content">
          <span class="hero-eyebrow">
            <span class="hero-eyebrow__dot"></span>
            校园闲置流转 · 同校同学面对面
          </span>

          <h1 class="hero-title">
            让闲置好物，<br />
            <span>在校园里继续发光</span>
          </h1>

          <p class="hero-desc">
            教材、数码、生活用品、运动器材……把用不上的东西交给需要的同学。校内面交，价格实在，交易更安心。
          </p>

          <form class="hero-search" role="search" @submit.prevent="search()">
            <el-icon class="hero-search__icon"><Search /></el-icon>
            <input
              v-model="keyword"
              type="search"
              placeholder="搜一搜：高数教材、iPad、羽毛球拍…"
              aria-label="搜索校园闲置"
            />
            <button type="submit" class="hero-search__btn">搜索好物</button>
          </form>

          <div class="hero-keywords">
            <span>大家在搜：</span>
            <button
              v-for="term in ['高等数学', 'iPad', '自行车', '羽毛球拍']"
              :key="term"
              type="button"
              @click="search(term)"
            >
              {{ term }}
            </button>
          </div>

          <ul class="hero-trust">
            <li v-for="item in trustItems" :key="item">
              <el-icon><CircleCheck /></el-icon>
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <div class="hero-visual__blob"></div>

          <div class="visual-card visual-card--back">
            <img src="/covers/6.svg" alt="" />
            <span class="visual-card__tag">运动器材</span>
          </div>

          <div class="visual-card visual-card--front">
            <img src="/covers/2.svg" alt="" />
            <div class="visual-card__body">
              <span class="visual-card__badge">同校面交</span>
              <strong>数码电子</strong>
              <small>当面验货 · 更安心</small>
            </div>
          </div>

          <div class="visual-note">
            <span class="visual-note__icon"><el-icon><CircleCheck /></el-icon></span>
            <div>
              <strong>校内真实交易</strong>
              <small>闲置循环，从一件好物开始</small>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container home-body">
      <!-- 分类宫格 -->
      <section class="home-section">
        <div class="section-head">
          <div>
            <h2>按分类逛逛</h2>
            <p>6 个分类，覆盖校园生活的角角落落</p>
          </div>
          <RouterLink to="/list" class="section-link">
            全部商品
            <el-icon><ArrowRight /></el-icon>
          </RouterLink>
        </div>

        <div class="category-grid">
          <button
            v-for="item in categoryList"
            :key="item.name"
            type="button"
            class="category-card"
            :style="{ '--cat-color': item.color, '--cat-soft': item.soft }"
            @click="goCategory(item.name)"
          >
            <span class="category-card__top">
              <span class="category-icon">
                <el-icon :size="21"><component :is="item.icon" /></el-icon>
              </span>
              <span class="category-arrow">→</span>
            </span>
            <span class="category-card__text">
              <strong>{{ item.name }}</strong>
              <small>{{ item.en }}</small>
            </span>
          </button>
        </div>
      </section>

      <!-- 最新发布 -->
      <section class="home-section">
        <div class="section-head">
          <div>
            <h2>最新发布</h2>
            <p>刚刚上架的校园闲置，手慢无</p>
          </div>
          <RouterLink to="/list" class="section-link">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </RouterLink>
        </div>

        <div v-if="loading" class="product-grid">
          <SkeletonCard v-for="index in 8" :key="index" />
        </div>

        <EmptyState
          v-else-if="loadError"
          title="好物加载失败"
          description="网络好像开小差了，稍后再试一次吧。"
          action-text="重新加载"
          @action="loadLatest"
        />

        <div v-else-if="latest.length" class="product-grid">
          <ProductCard v-for="product in latest" :key="product.id" :product="product" />
        </div>

        <EmptyState
          v-else
          title="还没有人发布商品"
          description="成为第一个发布闲置的同学吧，让好物流动起来。"
          action-text="去发布"
          @action="router.push('/publish')"
        />
      </section>

      <!-- 发布引导 -->
      <section class="home-cta">
        <div class="home-cta__text">
          <span class="home-cta__eyebrow">闲置变现 · 只要三步</span>
          <h2>宿舍里还有吃灰的好物？</h2>
          <p>拍照、定价、发布，三分钟让它遇见下一位同学。</p>
        </div>
        <div class="home-cta__actions">
          <el-button type="primary" size="large" @click="router.push('/publish')">
            立即发布闲置
          </el-button>
          <el-button size="large" @click="router.push('/list')">先逛逛再说</el-button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding-bottom: 72px;
}

/* ---------- Hero ---------- */
.home-hero {
  position: relative;
  overflow: hidden;
  padding: 56px 0 60px;
  background:
    radial-gradient(circle at 82% 18%, rgba(47, 111, 237, 0.1), transparent 30%),
    linear-gradient(180deg, #edf3ff 0%, rgba(246, 248, 252, 0.2) 100%);
}

.home-hero__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  align-items: center;
  gap: 48px;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 13px;
  border: 1px solid rgba(47, 111, 237, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--cm-primary);
  font-size: 12px;
  font-weight: 500;
}

.hero-eyebrow__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cm-primary);
}

.hero-title {
  margin-top: 20px;
  font-size: 42px;
  font-weight: 800;
  line-height: 1.28;
  letter-spacing: -1px;
}

.hero-title span {
  color: var(--cm-primary);
}

.hero-desc {
  max-width: 500px;
  margin-top: 16px;
  color: var(--cm-text-secondary);
  font-size: 14px;
  line-height: 1.85;
}

.hero-search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(520px, 100%);
  height: 56px;
  margin-top: 26px;
  padding: 0 6px 0 16px;
  border: 1px solid rgba(47, 111, 237, 0.18);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(35, 62, 120, 0.09);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.hero-search:focus-within {
  border-color: var(--cm-primary);
  box-shadow: 0 12px 30px rgba(47, 111, 237, 0.14);
}

.hero-search__icon {
  flex: none;
  color: var(--cm-text-muted);
  font-size: 18px;
}

.hero-search input {
  flex: 1;
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--cm-text);
  font-size: 14px;
}

.hero-search input::placeholder {
  color: var(--cm-text-muted);
}

.hero-search input::-webkit-search-cancel-button {
  display: none;
}

.hero-search__btn {
  flex: none;
  height: 44px;
  padding: 0 20px;
  border: 0;
  border-radius: 10px;
  background: var(--cm-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s ease;
}

.hero-search__btn:hover {
  background: var(--cm-primary-hover);
}

.hero-keywords {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  color: var(--cm-text-muted);
  font-size: 12px;
}

.hero-keywords button {
  padding: 2px 8px;
  border: 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--cm-text-secondary);
  font-size: 12px;
  transition: color 0.2s ease, background 0.2s ease;
}

.hero-keywords button:hover {
  background: #fff;
  color: var(--cm-primary);
}

.hero-trust {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 24px;
  color: var(--cm-text-muted);
  font-size: 12px;
}

.hero-trust li {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.hero-trust .el-icon {
  color: var(--cm-success);
  font-size: 14px;
}

/* ---------- Hero 装饰卡片 ---------- */
.hero-visual {
  position: relative;
  height: 380px;
}

.hero-visual__blob {
  position: absolute;
  top: 30px;
  right: 30px;
  width: 290px;
  height: 290px;
  border-radius: 50%;
  background: rgba(47, 111, 237, 0.08);
}

.visual-card {
  position: absolute;
  overflow: hidden;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 22px 46px rgba(30, 54, 105, 0.16);
}

.visual-card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 10px;
  object-fit: cover;
}

.visual-card--back {
  top: 84px;
  left: 0;
  width: 218px;
  transform: rotate(-7deg);
  opacity: 0.94;
}

.visual-card--back .visual-card__tag {
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  color: var(--cm-text-secondary);
  font-size: 11px;
}

.visual-card--front {
  top: 20px;
  right: 0;
  width: 258px;
  transform: rotate(3deg);
}

.visual-card__body {
  display: flex;
  flex-direction: column;
  padding: 11px 8px 6px;
}

.visual-card__badge {
  align-self: flex-start;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--cm-primary-soft);
  color: var(--cm-primary);
  font-size: 10px;
  font-weight: 600;
}

.visual-card__body strong {
  margin-top: 6px;
  font-size: 15px;
}

.visual-card__body small {
  margin-top: 2px;
  color: var(--cm-text-muted);
  font-size: 11px;
}

.visual-note {
  position: absolute;
  right: 132px;
  bottom: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 15px;
  border: 1px solid var(--cm-border);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(30, 54, 105, 0.12);
}

.visual-note__icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: #e9f8f1;
  color: var(--cm-success);
}

.visual-note div {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.visual-note strong {
  font-size: 12px;
}

.visual-note small {
  margin-top: 2px;
  color: var(--cm-text-muted);
  font-size: 10px;
}

/* ---------- 主体 ---------- */
.home-body {
  padding-top: 8px;
}

.home-section {
  margin-top: 48px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
}

.category-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius);
  background: var(--cm-surface);
  text-align: left;
  transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
}

.category-card:hover {
  transform: translateY(-4px);
  border-color: var(--cat-color);
  box-shadow: 0 14px 28px rgba(22, 34, 64, 0.1);
}

.category-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.category-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--cat-soft);
  color: var(--cat-color);
}

.category-arrow {
  color: var(--cm-text-muted);
  font-size: 14px;
  opacity: 0.5;
  transition: transform 0.22s ease, opacity 0.22s ease;
}

.category-card:hover .category-arrow {
  transform: translateX(3px);
  opacity: 1;
  color: var(--cat-color);
}

.category-card__text {
  display: flex;
  flex-direction: column;
}

.category-card__text strong {
  color: var(--cm-text);
  font-size: 14px;
  font-weight: 600;
}

.category-card__text small {
  margin-top: 2px;
  color: var(--cm-text-muted);
  font-size: 10px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

/* ---------- 发布引导 ---------- */
.home-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  margin-top: 56px;
  padding: 34px 38px;
  border: 1px solid rgba(47, 111, 237, 0.14);
  border-radius: var(--cm-radius-lg);
  background:
    radial-gradient(circle at 92% 0%, rgba(47, 111, 237, 0.1), transparent 38%),
    #f2f6ff;
}

.home-cta__eyebrow {
  color: var(--cm-primary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
}

.home-cta__text h2 {
  margin-top: 6px;
  font-size: 22px;
  line-height: 1.4;
  letter-spacing: -0.2px;
}

.home-cta__text p {
  margin-top: 4px;
  color: var(--cm-text-secondary);
  font-size: 13px;
}

.home-cta__actions {
  display: flex;
  gap: 10px;
  flex: none;
}

.home-cta__actions .el-button {
  margin-left: 0;
}

@media (max-width: 1100px) {
  .hero-title {
    font-size: 36px;
  }

  .category-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .home-hero {
    padding: 44px 0 48px;
  }

  .home-hero__inner {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .hero-visual {
    display: none;
  }

  .hero-title {
    font-size: 34px;
  }
}

@media (max-width: 640px) {
  .home {
    padding-bottom: 48px;
  }

  .hero-title {
    font-size: 29px;
  }

  .hero-desc {
    font-size: 13px;
  }

  .hero-search {
    height: 52px;
    padding-left: 13px;
  }

  .hero-search__btn {
    height: 42px;
    padding: 0 14px;
  }

  .hero-trust {
    gap: 12px;
  }

  .home-section {
    margin-top: 38px;
  }

  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .category-card {
    gap: 12px;
    padding: 14px;
  }

  .home-cta {
    flex-direction: column;
    align-items: flex-start;
    padding: 26px 22px;
    gap: 20px;
  }

  .home-cta__actions {
    width: 100%;
  }

  .home-cta__actions .el-button {
    flex: 1;
  }
}
</style>
