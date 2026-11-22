import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/list',
    name: 'List',
    component: () => import('@/views/ListView.vue'),
    meta: { title: '全部商品', keepAlive: true }
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: () => import('@/views/DetailView.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: () => import('@/views/PublishView.vue'),
    meta: { title: '发布闲置', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: { title: '我的收藏', requiresAuth: true }
  },
  {
    // 兜底路由：未知地址回到首页
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

/**
 * 全局前置守卫：
 * 1. 需要登录的页面未登录时跳转 /login?redirect=<原路径>
 * 2. 已登录用户不再进入登录 / 注册页
 */
router.beforeEach((to) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再继续')
    return {
      path: '/login',
      query: { redirect: to.fullPath }
    }
  }

  if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
    return { path: '/' }
  }

  return true
})

router.afterEach((to) => {
  const title = to.meta?.title
  document.title = title ? `${title} · 校园集市 Campus Market` : '校园集市 Campus Market'
})

export default router
