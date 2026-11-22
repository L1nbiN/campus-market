<script setup>
import AppHeader from '@/components/AppHeader.vue'

const year = new Date().getFullYear()
</script>

<template>
  <div class="app-shell">
    <AppHeader />

    <main class="app-main">
      <!-- 列表页使用 keep-alive 缓存筛选条件、分页与滚动位置 -->
      <router-view v-slot="{ Component }">
        <keep-alive :include="['ListView']">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>

    <footer class="app-footer">
      <div class="container app-footer__inner">
        <div class="app-footer__brand">
          <RouterLink to="/" class="app-footer__logo">
            <span class="brand-mark">CM</span>
            <span class="app-footer__name">校园集市<small>CAMPUS MARKET</small></span>
          </RouterLink>
          <p>让闲置在校园里继续发光。同校同学面对面交易，更简单，也更安心。</p>
        </div>

        <div class="app-footer__links">
          <h4>逛一逛</h4>
          <RouterLink to="/">首页</RouterLink>
          <RouterLink to="/list">全部商品</RouterLink>
          <RouterLink to="/favorites">我的收藏</RouterLink>
        </div>

        <div class="app-footer__links">
          <h4>我的</h4>
          <RouterLink to="/publish">发布闲置</RouterLink>
          <RouterLink to="/profile">个人中心</RouterLink>
          <RouterLink to="/login">登录 / 注册</RouterLink>
        </div>

        <div class="app-footer__note">
          <h4>关于本站</h4>
          <p>这是用于学习与作品展示的前端项目，商品、卖家与交易信息均为 Mock 数据。</p>
        </div>
      </div>

      <div class="app-footer__bottom">
        <div class="container">
          <span>© {{ year }} Campus Market · 校园二手交易平台</span>
          <span>Vue 3 + Vite + Pinia + Element Plus</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
}

.app-footer {
  margin-top: 48px;
  background: var(--cm-surface);
  border-top: 1px solid var(--cm-border);
}

.app-footer__inner {
  display: grid;
  grid-template-columns: 2fr 0.8fr 0.8fr 1.4fr;
  gap: 40px;
  padding-top: 44px;
  padding-bottom: 36px;
}

.app-footer__logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.app-footer__name {
  display: flex;
  flex-direction: column;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
}

.app-footer__name small {
  margin-top: 2px;
  color: var(--cm-text-muted);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 1.5px;
}

.app-footer__brand p {
  max-width: 330px;
  margin-top: 14px;
  color: var(--cm-text-muted);
  font-size: 13px;
  line-height: 1.8;
}

.app-footer__links {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.app-footer__links h4,
.app-footer__note h4 {
  margin-bottom: 3px;
  color: var(--cm-text);
  font-size: 13px;
  font-weight: 600;
}

.app-footer__links a {
  color: var(--cm-text-muted);
  font-size: 13px;
  transition: color 0.2s ease;
}

.app-footer__links a:hover {
  color: var(--cm-primary);
}

.app-footer__note p {
  color: var(--cm-text-muted);
  font-size: 12px;
  line-height: 1.8;
}

.app-footer__bottom {
  border-top: 1px solid var(--cm-border);
  padding: 16px 0;
  color: var(--cm-text-muted);
  font-size: 12px;
}

.app-footer__bottom .container {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .app-footer__inner {
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }

  .app-footer__brand {
    grid-column: 1 / -1;
  }

  .app-footer__note {
    grid-column: 1 / -1;
  }
}

@media (max-width: 560px) {
  .app-footer {
    margin-top: 32px;
  }

  .app-footer__inner {
    padding-top: 32px;
  }
}
</style>
