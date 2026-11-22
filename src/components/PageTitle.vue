<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="page-title">
    <div class="page-title__text">
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="page-title__extra">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.page-title h1 {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.4px;
}

.page-title p {
  margin-top: 6px;
  color: var(--cm-text-muted);
  font-size: 13px;
}

.page-title__extra {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
  padding-bottom: 2px;
}

@media (max-width: 640px) {
  .page-title {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 18px;
  }

  .page-title h1 {
    font-size: 22px;
  }
}
</style>
