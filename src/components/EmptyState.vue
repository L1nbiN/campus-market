<script setup>
import { Box } from '@element-plus/icons-vue'

defineProps({
  title: {
    type: String,
    default: '这里还空空的'
  },
  description: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: ''
  }
})

defineEmits(['action'])
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <el-icon :size="28"><Box /></el-icon>
    </div>
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <div class="empty-state__actions">
      <slot>
        <el-button v-if="actionText" type="primary" plain @click="$emit('action')">
          {{ actionText }}
        </el-button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  border: 1px dashed var(--cm-border-strong);
  border-radius: var(--cm-radius);
  background: var(--cm-surface);
  text-align: center;
}

.empty-state__icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--cm-primary-soft);
  color: var(--cm-primary);
}

.empty-state h3 {
  margin-top: 16px;
  font-size: 16px;
  font-weight: 600;
}

.empty-state p {
  max-width: 420px;
  margin-top: 6px;
  color: var(--cm-text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.empty-state__actions {
  margin-top: 18px;
}
</style>
