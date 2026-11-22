<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowDown,
  Menu,
  Plus,
  Search,
  Star,
  SwitchButton,
  User
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useFilterStore } from '@/stores/filter'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const filterStore = useFilterStore()

const keyword = ref(filterStore.query.keyword)
const drawerVisible = ref(false)

const navItems = [
  { label: '首页', path: '/' },
  { label: '全部商品', path: '/list' },
  { label: '发布闲置', path: '/publish' },
  { label: '我的收藏', path: '/favorites' }
]

const isLoggedIn = computed(() => userStore.isLoggedIn)
const displayName = computed(() => userStore.displayName)
const avatarText = computed(() => displayName.value.slice(0, 1))

// 列表页重置筛选或从首页带条件进入时，同步顶部搜索框
watch(
  () => filterStore.query.keyword,
  (value) => {
    keyword.value = value
  }
)

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

/**
 * 顶部搜索：统一写入 filter store 后再进入列表页，
 * 避免列表页和 header 各维护一套参数。
 */
function submitSearch() {
  filterStore.setFilter({
    keyword: keyword.value.trim(),
    category: '全部',
    sort: 'latest',
    page: 1
  })
  drawerVisible.value = false
  if (route.path !== '/list') {
    router.push('/list')
  }
}

async function handleCommand(command) {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'publish') {
    router.push('/publish')
  } else if (command === 'favorites') {
    router.push('/favorites')
  } else if (command === 'logout') {
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
    drawerVisible.value = false
    ElMessage.success('已退出登录')

    if (route.meta.requiresAuth) {
      router.replace('/')
    }
  }
}

function go(path) {
  drawerVisible.value = false
  router.push(path)
}
</script>

<template>
  <header class="app-header">
    <div class="container header-inner">
      <RouterLink to="/" class="brand" aria-label="校园集市首页">
        <span class="brand-mark">CM</span>
        <span class="brand-text">
          <strong>校园集市</strong>
          <small>CAMPUS MARKET</small>
        </span>
      </RouterLink>

      <nav class="nav" aria-label="主导航">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ 'is-active': isActive(item.path) }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="header-actions">
        <form class="header-search" role="search" @submit.prevent="submitSearch">
          <el-icon class="header-search__icon"><Search /></el-icon>
          <input
            v-model="keyword"
            type="search"
            placeholder="搜索教材、数码、生活好物"
            aria-label="搜索商品"
          />
          <button type="submit" class="header-search__btn">搜索</button>
        </form>

        <el-dropdown
          v-if="isLoggedIn"
          trigger="click"
          placement="bottom-end"
          @command="handleCommand"
        >
          <button type="button" class="user-trigger">
            <span class="user-avatar">{{ avatarText }}</span>
            <span class="user-name">{{ displayName }}</span>
            <el-icon class="user-arrow"><ArrowDown /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item command="publish">
                <el-icon><Plus /></el-icon>
                发布闲置
              </el-dropdown-item>
              <el-dropdown-item command="favorites">
                <el-icon><Star /></el-icon>
                我的收藏
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <div v-else class="auth-actions">
          <RouterLink to="/login" class="auth-link">登录</RouterLink>
          <RouterLink to="/register" class="auth-register">注册</RouterLink>
        </div>

        <button type="button" class="menu-btn" aria-label="打开菜单" @click="drawerVisible = true">
          <el-icon :size="20"><Menu /></el-icon>
        </button>
      </div>
    </div>

    <el-drawer v-model="drawerVisible" title="校园集市" direction="rtl" size="82%" append-to-body>
      <div class="drawer-content">
        <form class="drawer-search" @submit.prevent="submitSearch">
          <el-input
            v-model="keyword"
            placeholder="搜索商品"
            :prefix-icon="Search"
            clearable
          />
          <el-button type="primary" @click="submitSearch">搜索</el-button>
        </form>

        <nav class="drawer-nav" aria-label="移动端导航">
          <button
            v-for="item in navItems"
            :key="item.path"
            type="button"
            :class="{ 'is-active': isActive(item.path) }"
            @click="go(item.path)"
          >
            <span>{{ item.label }}</span>
            <span class="drawer-nav__arrow">→</span>
          </button>
        </nav>

        <div v-if="isLoggedIn" class="drawer-user">
          <div class="drawer-user__info">
            <span class="user-avatar user-avatar--lg">{{ avatarText }}</span>
            <div>
              <strong>{{ displayName }}</strong>
              <small>{{ userStore.userInfo?.college }}</small>
            </div>
          </div>
          <div class="drawer-user__actions">
            <el-button @click="go('/profile')">个人中心</el-button>
            <el-button type="danger" plain @click="handleCommand('logout')">退出登录</el-button>
          </div>
        </div>

        <div v-else class="drawer-auth">
          <el-button type="primary" @click="go('/login')">登录</el-button>
          <el-button @click="go('/register')">注册</el-button>
        </div>

        <p class="drawer-tip">校内闲置交易 · 当面验货更安心</p>
      </div>
    </el-drawer>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  border-bottom: 1px solid var(--cm-border);
  backdrop-filter: blur(14px);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 26px;
  height: var(--cm-header-height);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex: none;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-text strong {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.brand-text small {
  margin-top: 3px;
  color: var(--cm-text-muted);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 1.4px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 100%;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 100%;
  color: var(--cm-text-secondary);
  font-size: 14px;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--cm-primary);
}

.nav-link.is-active {
  color: var(--cm-primary);
  font-weight: 600;
}

.nav-link.is-active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: var(--cm-primary);
  content: '';
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
  min-width: 0;
}

.header-search {
  display: flex;
  align-items: center;
  width: 274px;
  height: 38px;
  padding: 0 4px 0 12px;
  border: 1px solid var(--cm-border);
  border-radius: 999px;
  background: var(--cm-bg);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.header-search:focus-within {
  border-color: var(--cm-primary);
  background: #fff;
}

.header-search__icon {
  flex: none;
  color: var(--cm-text-muted);
  font-size: 15px;
}

.header-search input {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 0 8px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--cm-text);
  font-size: 13px;
}

.header-search input::placeholder {
  color: var(--cm-text-muted);
}

.header-search input::-webkit-search-cancel-button {
  display: none;
}

.header-search__btn {
  flex: none;
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: var(--cm-primary);
  color: #fff;
  font-size: 12px;
  transition: background 0.2s ease;
}

.header-search__btn:hover {
  background: var(--cm-primary-hover);
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 10px 0 4px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--cm-text);
  transition: background 0.2s ease, border-color 0.2s ease;
}

.user-trigger:hover {
  border-color: var(--cm-border);
  background: var(--cm-bg);
}

.user-avatar {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: 50%;
  background: var(--cm-primary-soft);
  color: var(--cm-primary);
  font-size: 13px;
  font-weight: 700;
}

.user-avatar--lg {
  width: 42px;
  height: 42px;
  font-size: 16px;
}

.user-name {
  max-width: 84px;
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-arrow {
  color: var(--cm-text-muted);
  font-size: 12px;
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-link {
  padding: 6px 10px;
  border-radius: 8px;
  color: var(--cm-text-secondary);
  font-size: 13px;
  transition: color 0.2s ease, background 0.2s ease;
}

.auth-link:hover {
  background: var(--cm-bg);
  color: var(--cm-primary);
}

.auth-register {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 16px;
  border-radius: 8px;
  background: var(--cm-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.2s ease;
}

.auth-register:hover {
  background: var(--cm-primary-hover);
}

.menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--cm-border);
  border-radius: 9px;
  background: #fff;
  color: var(--cm-text);
}

/* ---------- 移动端抽屉 ---------- */
.drawer-content {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.drawer-search {
  display: flex;
  gap: 8px;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--cm-border);
}

.drawer-nav button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 4px;
  border: 0;
  border-bottom: 1px solid var(--cm-border);
  background: transparent;
  color: var(--cm-text-secondary);
  font-size: 15px;
  text-align: left;
}

.drawer-nav button.is-active {
  color: var(--cm-primary);
  font-weight: 600;
}

.drawer-nav__arrow {
  color: var(--cm-text-muted);
  font-size: 13px;
}

.drawer-user {
  padding: 14px;
  border-radius: var(--cm-radius);
  background: var(--cm-primary-soft-2);
}

.drawer-user__info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-user__info div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.drawer-user__info strong {
  font-size: 14px;
}

.drawer-user__info small {
  margin-top: 2px;
  color: var(--cm-text-muted);
  font-size: 12px;
}

.drawer-user__actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.drawer-user__actions .el-button {
  flex: 1;
  margin-left: 0;
}

.drawer-auth {
  display: flex;
  gap: 10px;
}

.drawer-auth .el-button {
  flex: 1;
  margin-left: 0;
}

.drawer-tip {
  color: var(--cm-text-muted);
  font-size: 12px;
  text-align: center;
}

@media (max-width: 1100px) {
  .header-search {
    display: none;
  }
}

@media (max-width: 900px) {
  .nav {
    display: none;
  }

  .menu-btn {
    display: inline-flex;
  }
}

@media (max-width: 560px) {
  .header-inner {
    gap: 14px;
  }

  .brand-text small {
    display: none;
  }

  .user-name {
    display: none;
  }

  .auth-link {
    display: none;
  }
}
</style>
