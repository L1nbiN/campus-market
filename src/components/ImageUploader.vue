<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  // 压缩后的最大宽度（px）
  maxWidth: {
    type: Number,
    default: 1200
  },
  // 原图体积上限（MB）
  maxSizeMb: {
    type: Number,
    default: 8
  }
})

const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)
const compressing = ref(false)
const dragOver = ref(false)

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function pickFile() {
  if (compressing.value) return
  inputRef.value?.click()
}

/**
 * Canvas 压缩：
 * 1. FileReader 读取本地文件为 DataURL
 * 2. 按最大宽度等比缩放
 * 3. 绘制到 Canvas 后导出 JPEG（质量 0.8），避免原图过大占满 localStorage
 */
function compressImage(file, maxWidth) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()

      image.onload = () => {
        const ratio = Math.min(1, maxWidth / image.width)
        const width = Math.max(1, Math.round(image.width * ratio))
        const height = Math.max(1, Math.round(image.height * ratio))

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('当前浏览器不支持 Canvas，无法压缩图片'))
          return
        }

        // 透明 PNG 转 JPEG 后背景会变黑，先铺一层白色
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
        context.drawImage(image, 0, 0, width, height)

        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }

      image.onerror = () => reject(new Error('图片解析失败，请换一张试试'))
      image.src = reader.result
    }

    reader.onerror = () => reject(new Error('读取文件失败，请重试'))
    reader.readAsDataURL(file)
  })
}

async function handleFile(file) {
  if (!file) return

  if (!ACCEPTED_TYPES.includes(file.type)) {
    ElMessage.warning('请选择 JPG / PNG / WebP 格式的图片')
    return
  }

  if (file.size > props.maxSizeMb * 1024 * 1024) {
    ElMessage.warning(`图片不能超过 ${props.maxSizeMb}MB，请先压缩后再试`)
    return
  }

  compressing.value = true
  try {
    const dataUrl = await compressImage(file, props.maxWidth)
    emit('update:modelValue', dataUrl)
    ElMessage.success('图片已压缩，预览已更新')
  } catch (error) {
    ElMessage.error(error?.message || '图片处理失败，请重试')
  } finally {
    compressing.value = false
  }
}

function onChange(event) {
  const file = event.target.files?.[0]
  handleFile(file)
  // 允许重复选择同一个文件
  event.target.value = ''
}

function onDrop(event) {
  dragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  handleFile(file)
}

function removeImage() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="image-uploader">
    <div v-if="modelValue" class="image-uploader__preview">
      <img :src="modelValue" alt="商品图片预览" />
      <div v-if="compressing" class="image-uploader__loading">
        <el-icon class="is-loading" :size="22"><Loading /></el-icon>
        <span>正在压缩…</span>
      </div>
      <div class="image-uploader__actions">
        <el-button size="small" @click="pickFile">更换图片</el-button>
        <el-button size="small" type="danger" plain @click="removeImage">移除</el-button>
      </div>
    </div>

    <button
      v-else
      type="button"
      class="image-uploader__dropzone"
      :class="{ 'is-dragover': dragOver, 'is-compressing': compressing }"
      @click="pickFile"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <span class="image-uploader__icon">
        <el-icon v-if="compressing" class="is-loading" :size="22"><Loading /></el-icon>
        <el-icon v-else :size="22"><Plus /></el-icon>
      </span>
      <strong>{{ compressing ? '正在压缩图片…' : '点击选择本地图片' }}</strong>
      <small>支持 JPG / PNG / WebP，也可直接拖拽到此处</small>
    </button>

    <input
      ref="inputRef"
      class="image-uploader__input"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      @change="onChange"
    />

    <p class="image-uploader__hint">
      图片会先用 Canvas 压缩到宽度不超过 {{ maxWidth }}px 的 JPEG，仅保存在浏览器本地（Mock 模式），不会上传到服务器。
    </p>
  </div>
</template>

<style scoped>
.image-uploader {
  width: 100%;
}

.image-uploader__preview {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--cm-border);
  border-radius: var(--cm-radius);
  background: #f1f4f9;
}

.image-uploader__preview img {
  width: 100%;
  max-height: 320px;
  object-fit: contain;
}

.image-uploader__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--cm-border);
  background: #fff;
}

.image-uploader__loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.82);
  color: var(--cm-primary);
  font-size: 13px;
  backdrop-filter: blur(2px);
}

.image-uploader__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 34px 20px;
  border: 1.5px dashed var(--cm-border-strong);
  border-radius: var(--cm-radius);
  background: var(--cm-primary-soft-2);
  color: var(--cm-text-secondary);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.image-uploader__dropzone:hover,
.image-uploader__dropzone.is-dragover {
  border-color: var(--cm-primary);
  background: var(--cm-primary-soft);
}

.image-uploader__dropzone.is-compressing {
  cursor: progress;
}

.image-uploader__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 10px;
  border-radius: 50%;
  background: #fff;
  color: var(--cm-primary);
  box-shadow: var(--cm-shadow-xs);
}

.image-uploader__dropzone strong {
  color: var(--cm-text);
  font-size: 14px;
  font-weight: 600;
}

.image-uploader__dropzone small {
  margin-top: 4px;
  color: var(--cm-text-muted);
  font-size: 12px;
}

.image-uploader__input {
  display: none;
}

.image-uploader__hint {
  margin-top: 8px;
  color: var(--cm-text-muted);
  font-size: 12px;
  line-height: 1.7;
}
</style>
