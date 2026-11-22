<script setup>
import { computed } from 'vue'
import { Close, Star, View } from '@element-plus/icons-vue'
import { formatPrice } from '@/utils/format'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  // 收藏页使用：右上角显示取消收藏按钮
  showRemove: {
    type: Boolean,
    default: false
  }
})

defineEmits(['remove'])

const cover = computed(() => props.product?.cover || '/covers/1.svg')
const originalPrice = computed(() => Number(props.product?.originalPrice) || 0)
const hasDiscount = computed(() => originalPrice.value > Number(props.product?.price))
const sellerName = computed(() => props.product?.seller?.name || '匿名同学')

function handleImageError(event) {
  event.target.src = '/covers/1.svg'
}
</script>

<template>
  <article class="product-card">
    <div class="product-card__cover">
      <RouterLink
        :to="`/detail/${product.id}`"
        class="product-card__cover-link"
        :aria-label="`查看商品：${product.title}`"
      >
        <img :src="cover" :alt="product.title" loading="lazy" @error="handleImageError" />
      </RouterLink>
      <span class="product-card__category">{{ product.category }}</span>
      <span v-if="product.condition" class="product-card__condition">{{ product.condition }}</span>
      <button
        v-if="showRemove"
        type="button"
        class="product-card__remove"
        title="取消收藏"
        aria-label="取消收藏"
        @click.prevent.stop="$emit('remove')"
      >
        <el-icon><Close /></el-icon>
      </button>
    </div>

    <RouterLink :to="`/detail/${product.id}`" class="product-card__body">
      <h3 class="product-card__title">{{ product.title }}</h3>
      <p class="product-card__desc">{{ product.desc }}</p>

      <div class="product-card__price">
        <span class="price-now"><em>¥</em>{{ formatPrice(product.price) }}</span>
        <span v-if="hasDiscount" class="price-original">¥{{ formatPrice(originalPrice) }}</span>
      </div>

      <div class="product-card__meta">
        <span class="product-card__seller">{{ sellerName }}</span>
        <span class="product-card__stats">
          <span><el-icon><View /></el-icon>{{ product.views }}</span>
          <span><el-icon><Star /></el-icon>{{ product.favorites }}</span>
        </span>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius);
  background: var(--cm-surface);
  box-shadow: var(--cm-shadow-xs);
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  border-color: rgba(47, 111, 237, 0.28);
  box-shadow: var(--cm-shadow-hover);
}

.product-card__cover {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  background: #eef2f8;
}

.product-card__cover-link {
  display: block;
  height: 100%;
}

.product-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-card__cover img {
  transform: scale(1.04);
}

.product-card__category {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--cm-primary);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.6;
  backdrop-filter: blur(4px);
}

.product-card__condition {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(24, 34, 52, 0.58);
  color: #fff;
  font-size: 10px;
  line-height: 1.7;
  backdrop-filter: blur(4px);
}

.product-card__remove {
  position: absolute;
  top: 10px;
  right: 10px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.94);
  color: var(--cm-text-secondary);
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.product-card:hover .product-card__remove,
.product-card__remove:focus-visible {
  opacity: 1;
}

.product-card__remove:hover {
  background: #fff0ef;
  color: var(--cm-danger);
}

@media (hover: none) {
  .product-card__remove {
    opacity: 1;
  }
}

.product-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 13px 14px 14px;
}

.product-card__title {
  display: -webkit-box;
  overflow: hidden;
  min-height: 44px;
  color: var(--cm-text);
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-card__desc {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 5px;
  color: var(--cm-text-muted);
  font-size: 12px;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.product-card__price {
  display: flex;
  align-items: baseline;
  gap: 7px;
  margin-top: 10px;
}

.price-now {
  color: var(--cm-price);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.3px;
  line-height: 1.2;
}

.price-now em {
  margin-right: 1px;
  font-size: 13px;
  font-style: normal;
  font-weight: 600;
}

.price-original {
  color: var(--cm-text-muted);
  font-size: 12px;
  text-decoration: line-through;
}

.product-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid #f1f4f9;
  color: var(--cm-text-muted);
  font-size: 11px;
}

.product-card__seller {
  overflow: hidden;
  max-width: 55%;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-card__stats {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  flex: none;
}

.product-card__stats span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.product-card__stats .el-icon {
  font-size: 12px;
}

@media (max-width: 480px) {
  .product-card__body {
    padding: 11px;
  }

  .product-card__title {
    min-height: 42px;
    font-size: 13.5px;
  }

  .product-card__desc {
    display: none;
  }

  .price-now {
    font-size: 18px;
  }

  .product-card__condition {
    display: none;
  }
}
</style>
