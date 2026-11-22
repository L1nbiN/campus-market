<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { InfoFilled, Lock, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { demoAccounts } from '@/mock/data'
import { sanitizeRedirect } from '@/utils/navigation'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ]
}

const isMockMode = import.meta.env.VITE_USE_MOCK !== 'false'
const redirect = computed(() => sanitizeRedirect(route.query.redirect))
const registerLink = computed(() => ({
  path: '/register',
  query: route.query.redirect ? { redirect: route.query.redirect } : {}
}))

function fillDemo(account) {
  form.username = account.username
  form.password = account.password
}

async function handleSubmit() {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.login({
      username: form.username.trim(),
      password: form.password
    })
    ElMessage.success('登录成功，欢迎回来')
    router.replace(redirect.value)
  } catch {
    // 错误提示由 api 层统一处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-card">
      <RouterLink to="/" class="auth-brand">
        <span class="brand-mark">CM</span>
        校园集市
      </RouterLink>

      <h1>欢迎回来</h1>
      <p class="auth-subtitle">登录后即可发布闲置、收藏心仪好物</p>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
        @submit.prevent
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
            autocomplete="username"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            autocomplete="current-password"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          class="auth-submit"
          :loading="loading"
          @click="handleSubmit"
        >
          登录
        </el-button>
      </el-form>

      <div v-if="isMockMode" class="demo-box">
        <p class="demo-box__title">
          <el-icon><InfoFilled /></el-icon>
          演示账号（Mock 模式）
        </p>
        <div class="demo-box__list">
          <div v-for="account in demoAccounts" :key="account.username" class="demo-box__item">
            <span>
              <code>{{ account.username }}</code>
              /
              <code>{{ account.password }}</code>
              <em>{{ account.name }}</em>
            </span>
            <el-button size="small" text type="primary" @click="fillDemo(account)">
              一键填充
            </el-button>
          </div>
        </div>
      </div>

      <p class="auth-switch">
        还没有账号？
        <RouterLink :to="registerLink">立即注册</RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.auth-card :deep(.el-form-item) {
  margin-bottom: 20px;
}

.demo-box__item em {
  margin-left: 4px;
  color: var(--cm-text-muted);
  font-style: normal;
}

.demo-box__item code {
  padding: 1px 5px;
  border-radius: 4px;
  background: #fff;
  border: 1px solid var(--cm-border);
}

.demo-box__item .el-button {
  margin-left: 0;
}
</style>
