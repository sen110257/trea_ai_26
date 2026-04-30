<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium'
  },
  text: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3">
    <div 
      class="loading-spinner"
      :class="{
        'w-6 h-6 border-2': size === 'small',
        'w-10 h-10 border-3': size === 'medium',
        'w-16 h-16 border-4': size === 'large'
      }"
    />
    <p v-if="text" class="text-sm text-gray-500">{{ text }}</p>
  </div>
</template>
