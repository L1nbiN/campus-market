<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CATEGORIES, CONDITIONS } from '@/constants/product'
import { publishProduct } from '@/api/product'
import { useUserStore } from '@/stores/user'
import ImageUploader from '@/components/ImageUploader.vue'
import ProductCard from '@/components/ProductCard.vue'
import PageTitle from '@/components/PageTitle.vue'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const publishing = ref(false)

const form = reactive({
  title: '',
  price: undefined,
  originalPrice: undefined,
  category: '',
  condition: '九成新',
  desc: '',
  cover: ''
})

function validateOriginalPrice(rule, value, callback) {
  if (value === undefined || value === null || value === '') {
    callback()
    return
  }
  if (Number(value) <= Number(form.price)) {
    callback(new Error('原价需要高于售价'))
    return
  }
  callback()
}

const rules = {
  title: [
    { required: true, message: '请填写商品标题', trigger: 'blur' },
    { min: 4, max: 40, message: '标题长度需在 4-40 个字符之间', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请填写售价', trigger: 'change' },
    { type: 'number', min: 0.01, message: '售价需要大于 0', trigger: 'change' }
  ],
  originalPrice: [{ validator: validateOriginalPrice, trigger: 'change' }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  condition: [{ required: true, message: '请选择商品成色', trigger: 'change' }],
  desc: [
    { required: true, message: '请填写商品描述', trigger: 'blur' },
    { min: 10, max: 300, message: '描述长度需在 10-300 个字符之间', trigger: 'blur' }
  ],
  cover: [{ required: true, message: '请上传一张商品图片', trigger: 'change' }]
}

/**
 * 右侧实时预览：复用列表页的 ProductCard，
 * 让发布者在提交前就能看到商品在列表中的样子。
 */
const previewProduct = computed(() => ({
  id: 'preview',
  title: form.title.trim() || '你的商品标题会显示在这里',
  price: Number(form.price) || 0,
  originalPrice: Number(form.originalPrice) || 0,
  category: form.category || '待选择分类',
  condition: form.condition,
  cover: form.cover || '/covers/1.svg',
  desc:
    form.desc.trim() ||
    '写清楚购买时间、使用情况和交易地点，会让同学更放心地联系你。',
  seller: {
    name: userStore.userInfo?.name || '我'
  },
  views: 0,
  favorites: 0
}))

watch(
  () => form.price,
  () => {
    if (form.originalPrice) {
      formRef.value?.validateField('originalPrice').catch(() => {})
    }
  }
)

watch(
  () => form.cover,
  (value) => {
    if (value) {
      formRef.value?.validateField('cover').catch(() => {})
    }
  }
)

async function handleSubmit() {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    ElMessage.warning('还有必填信息没有填写完整')
    return
  }

  publishing.value = true
  try {
    const product = await publishProduct({
      title: form.title.trim(),
      price: Number(form.price),
      originalPrice: Number(form.originalPrice) || 0,
      category: form.category,
      condition: form.condition,
      desc: form.desc.trim(),
      cover: form.cover
    })

    ElMessage.success('发布成功，去商品详情看看吧')
    router.push(`/detail/${product.id}`)
  } catch {
    // 错误提示由 api 层统一处理
  } finally {
    publishing.value = false
  }
}

async function handleReset() {
  try {
    await ElMessageBox.confirm('确定清空当前填写的所有内容吗？', '清空表单', {
      confirmButtonText: '清空',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  formRef.value?.resetFields()
  form.cover = ''
  ElMessage.success('表单已清空')
}
</script>

<template>
  <div class="container page publish-page">
    <PageTitle
      title="发布闲置"
      subtitle="填写商品信息，让它在校园里找到下一位主人。发布完全免费。"
    />

    <div class="publish-layout">
      <section class="publish-card">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          size="large"
          @submit.prevent
        >
          <div class="form-grid">
            <el-form-item label="商品标题" prop="title" class="span-2">
              <el-input
                v-model="form.title"
                maxlength="40"
                show-word-limit
                placeholder="例如：《高等数学》同济第七版 上下册"
              />
            </el-form-item>

            <el-form-item label="售价（元）" prop="price">
              <el-input-number
                v-model="form.price"
                :min="0"
                :max="99999"
                :precision="2"
                :step="1"
                controls-position="right"
                placeholder="0.00"
              />
            </el-form-item>

            <el-form-item label="原价（元，选填）" prop="originalPrice">
              <el-input-number
                v-model="form.originalPrice"
                :min="0"
                :max="999999"
                :precision="2"
                :step="1"
                controls-position="right"
                placeholder="填写后详情页会显示划线价"
              />
            </el-form-item>

            <el-form-item label="商品分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类">
                <el-option v-for="category in CATEGORIES" :key="category" :label="category" :value="category" />
              </el-select>
            </el-form-item>

            <el-form-item label="商品成色" prop="condition">
              <el-select v-model="form.condition" placeholder="请选择成色">
                <el-option v-for="condition in CONDITIONS" :key="condition" :label="condition" :value="condition" />
              </el-select>
            </el-form-item>

            <el-form-item label="商品描述" prop="desc" class="span-2">
              <el-input
                v-model="form.desc"
                type="textarea"
                :rows="5"
                maxlength="300"
                show-word-limit
                placeholder="介绍一下购买时间、使用情况、有无瑕疵，以及方便的交易地点和时间…"
              />
            </el-form-item>

            <el-form-item label="商品图片" prop="cover" class="span-2">
              <ImageUploader v-model="form.cover" />
            </el-form-item>
          </div>

          <div class="form-actions">
            <el-button size="large" @click="handleReset">清空表单</el-button>
            <el-button type="primary" size="large" :loading="publishing" @click="handleSubmit">
              发布商品
            </el-button>
          </div>
        </el-form>
      </section>

      <aside class="publish-aside">
        <div class="aside-card">
          <h3>发布小贴士</h3>
          <ol class="tips">
            <li>
              <span class="tips__index">1</span>
              <div>
                <strong>标题写清楚</strong>
                <p>品牌、型号、规格写进标题，同学更容易搜到。</p>
              </div>
            </li>
            <li>
              <span class="tips__index">2</span>
              <div>
                <strong>如实描述成色</strong>
                <p>主动说明瑕疵，能减少反复沟通和退货纠纷。</p>
              </div>
            </li>
            <li>
              <span class="tips__index">3</span>
              <div>
                <strong>约定校内面交</strong>
                <p>建议在图书馆、食堂等人多的地方验货交易。</p>
              </div>
            </li>
          </ol>
        </div>

        <div class="aside-card">
          <h3>效果预览</h3>
          <p class="aside-sub">商品出现在列表页时大致是这样</p>
          <div class="preview-wrap">
            <ProductCard :product="previewProduct" />
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.publish-page {
  max-width: 1120px;
}

.publish-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  align-items: start;
  gap: 26px;
}

.publish-card {
  padding: 26px;
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius);
  background: var(--cm-surface);
  box-shadow: var(--cm-shadow-xs);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 20px;
}

.span-2 {
  grid-column: 1 / -1;
}

.form-grid :deep(.el-input-number),
.form-grid :deep(.el-select) {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
  padding-top: 20px;
  border-top: 1px solid #f1f4f9;
}

.form-actions .el-button {
  margin-left: 0;
  min-width: 120px;
}

/* ---------- 侧栏 ---------- */
.publish-aside {
  position: sticky;
  top: calc(var(--cm-header-height) + 20px);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.aside-card {
  padding: 20px;
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius);
  background: var(--cm-surface);
  box-shadow: var(--cm-shadow-xs);
}

.aside-card h3 {
  font-size: 15px;
  font-weight: 600;
}

.aside-sub {
  margin-top: 4px;
  color: var(--cm-text-muted);
  font-size: 12px;
}

.tips {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.tips li {
  display: flex;
  gap: 10px;
}

.tips__index {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex: none;
  border-radius: 50%;
  background: var(--cm-primary-soft);
  color: var(--cm-primary);
  font-size: 11px;
  font-weight: 700;
}

.tips strong {
  font-size: 13px;
  font-weight: 600;
}

.tips p {
  margin-top: 2px;
  color: var(--cm-text-muted);
  font-size: 12px;
  line-height: 1.7;
}

.preview-wrap {
  margin-top: 14px;
  pointer-events: none;
}

@media (max-width: 980px) {
  .publish-layout {
    grid-template-columns: 1fr;
  }

  .publish-aside {
    position: static;
  }
}

@media (max-width: 640px) {
  .publish-card {
    padding: 18px 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .span-2 {
    grid-column: auto;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions .el-button {
    width: 100%;
  }
}
</style>
