<template>
  <div class="skeleton-card" aria-hidden="true">
    <div class="skeleton-card__cover skeleton-shimmer"></div>
    <div class="skeleton-card__body">
      <div class="skeleton-line skeleton-line--title skeleton-shimmer"></div>
      <div class="skeleton-line skeleton-line--title skeleton-line--short skeleton-shimmer"></div>
      <div class="skeleton-line skeleton-line--text skeleton-shimmer"></div>
      <div class="skeleton-line skeleton-line--price skeleton-shimmer"></div>
      <div class="skeleton-card__footer">
        <div class="skeleton-line skeleton-line--meta skeleton-shimmer"></div>
        <div class="skeleton-line skeleton-line--meta skeleton-shimmer"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  overflow: hidden;
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius);
  background: var(--cm-surface);
}

.skeleton-card__cover {
  aspect-ratio: 4 / 3;
}

.skeleton-card__body {
  padding: 14px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
}

.skeleton-line--title {
  height: 14px;
  margin-bottom: 8px;
}

.skeleton-line--short {
  width: 64%;
}

.skeleton-line--text {
  width: 88%;
  height: 10px;
  margin-top: 12px;
}

.skeleton-line--price {
  width: 38%;
  height: 20px;
  margin-top: 14px;
}

.skeleton-card__footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid #f1f4f9;
}

.skeleton-line--meta {
  width: 28%;
  height: 10px;
}

.skeleton-shimmer {
  background: linear-gradient(90deg, #eef2f8 25%, #f7f9fc 37%, #eef2f8 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
