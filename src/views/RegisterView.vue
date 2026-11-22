<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, School, User, UserFilled } from '@element-plus/icons-vue'
import { register } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { sanitizeRedirect } from '@/utils/navigation'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  name: '',
  college: '',
  password: '',
  confirmPassword: ''
})

function validateConfirmPassword(rule, value, callback) {
  if (!value) {
    callback(new Error('请再次输入密码'))
    return
  }
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]{3,20}$/,
      message: '用户名为 3-20 位字母、数字或下划线',
      trigger: 'blur'
    }
  ],
  name: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 12, message: '昵称长度为 2-12 个字符', trigger: 'blur' }
  ],
  college: [{ required: true, message: '请填写学院与年级', trigger: 'blur' }],
  password: [
    { required: true, message: '请设置密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 位', trigger: 'blur' }
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }]
}

const redirect = computed(() => sanitizeRedirect(route.query.redirect))
const loginLink = computed(() => ({
  path: '/login',
  query: route.query.redirect ? { redirect: route.query.redirect } : {}
}))

watch(
  () => form.password,
  () => {
    if (form.confirmPassword) {
      formRef.value?.validateField('confirmPassword').catch(() => {})
    }
  }
)

async function handleSubmit() {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await register({
      username: form.username.trim(),
      password: form.password,
      name: form.name.trim(),
      college: form.college.trim()
    })

    // 注册成功后自动登录，直接进入注册前的目标页面
    await userStore.login({
      username: form.username.trim(),
      password: form.password
    })

    ElMessage.success('注册成功，欢迎加入校园集市')
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
    <div class="auth-card auth-card--wide">
      <RouterLink to="/" class="auth-brand">
        <span class="brand-mark">CM</span>
        校园集市
      </RouterLink>

      <h1>创建账号</h1>
      <p class="auth-subtitle">加入校园集市，发布闲置、淘到好物，让闲置流动起来</p>

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
            placeholder="3-20 位字母、数字或下划线"
            :prefix-icon="User"
            clearable
            autocomplete="username"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-form-item label="昵称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="同学们看到的名字，例如：林晓"
            :prefix-icon="UserFilled"
            maxlength="12"
            show-word-limit
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-form-item label="学院 / 年级" prop="college">
          <el-input
            v-model="form.college"
            placeholder="例如：计算机学院 · 2024级"
            :prefix-icon="School"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-form-item label="设置密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="至少 6 位字符"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            :prefix-icon="Lock"
            show-password
            autocomplete="new-password"
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
          注册并登录
        </el-button>
      </el-form>

      <p class="auth-switch">
        已经有账号了？
        <RouterLink :to="loginLink">直接登录</RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.auth-card :deep(.el-form-item) {
  margin-bottom: 18px;
}
</style>
