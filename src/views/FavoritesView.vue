<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star } from '@element-plus/icons-vue'
import { getFavorites, toggleFavorite } from '@/api/product'
import ProductCard from '@/components/ProductCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageTitle from '@/components/PageTitle.vue'

const router = useRouter()

const list = ref([])
const loading = ref(true)
const loadError = ref(false)
const removingId = ref('')

async function loadFavorites() {
  loading.value = true
  loadError.value = false

  try {
    list.value = await getFavorites()
  } catch {
    // 错误提示由 api 层统一处理
    loadError.value = true
  } finally {
    loading.value = false
  }
}

async function handleRemove(product) {
  if (removingId.value) return

  removingId.value = product.id
  try {
    const result = await toggleFavorite(product.id)
    if (!result.favorited) {
      list.value = list.value.filter((item) => item.id !== product.id)
      ElMessage.success('已取消收藏')
    }
  } catch {
    // 错误提示由 api 层统一处理
  } finally {
    removingId.value = ''
  }
}

onMounted(loadFavorites)
</script>

<template>
  <div class="container page favorites-page">
    <PageTitle title="我的收藏" subtitle="收藏的校园好物都在这里，方便随时回来看看">
      <span v-if="!loading" class="favorite-count">
        <el-icon><Star /></el-icon>
        共 {{ list.length }} 件
      </span>
    </PageTitle>

    <div v-if="loading" class="product-grid">
      <SkeletonCard v-for="index in 8" :key="index" />
    </div>

    <EmptyState
      v-else-if="loadError"
      title="收藏加载失败"
      description="网络好像开小差了，请稍后重试。"
      action-text="重新加载"
      @action="loadFavorites"
    />

    <div v-else-if="list.length" class="product-grid">
      <ProductCard
        v-for="product in list"
        :key="product.id"
        :product="product"
        show-remove
        @remove="handleRemove(product)"
      />
    </div>

    <EmptyState
      v-else
      title="收藏夹还是空的"
      description="逛商品时点一下「收藏商品」，喜欢的好物就会出现在这里。"
      action-text="去逛逛校园好物"
      @action="router.push('/list')"
    />
  </div>
</template>

<style scoped>
.favorites-page {
  padding-top: 32px;
}

.favorite-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: 999px;
  background: #fff3ee;
  color: var(--cm-price);
  font-size: 12px;
  font-weight: 500;
}

@media (max-width: 640px) {
  .favorites-page {
    padding-top: 24px;
  }
}
</style>
