<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'cover'
  },
  title: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['error', 'load'])

const isError = ref(false)
const isLoading = ref(true)

const gradientColors = [
  'from-purple-400 to-indigo-500',
  'from-pink-400 to-purple-500',
  'from-blue-400 to-indigo-500',
  'from-teal-400 to-cyan-500',
  'from-orange-400 to-pink-500',
  'from-green-400 to-teal-500'
]

const displayTitle = computed(() => {
  return props.title || props.alt || '?'
})

const titleInitial = computed(() => {
  const title = displayTitle.value
  return title.length > 0 ? title[0] : '?'
})

const authorInitial = computed(() => {
  const author = props.author || ''
  return author.length > 0 ? author[0] : ''
})

const gradientClass = computed(() => {
  const hash = displayTitle.value.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + acc
  }, 0)
  return gradientColors[hash % gradientColors.length]
})

function handleLoad() {
  isLoading.value = false
  isError.value = false
  emit('load')
}

function handleError() {
  isLoading.value = false
  isError.value = true
  emit('error')
}
</script>

<template>
  <div class="relative w-full h-full overflow-hidden">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="!isError && src"
        class="absolute inset-0"
      >
        <img
          :src="src"
          :alt="alt"
          class="w-full h-full object-cover transition-opacity duration-300"
          :class="{ 'opacity-0': isLoading }"
          @load="handleLoad"
          @error="handleError"
          loading="lazy"
        />
        
        <div 
          v-if="isLoading"
          class="absolute inset-0 flex items-center justify-center bg-gray-100"
        >
          <div class="w-8 h-8 border-3 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>

      <div 
        v-else
        class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br"
        :class="gradientClass"
      >
        <div class="flex flex-col items-center justify-center text-white">
          <div v-if="type === 'cover'" class="flex flex-col items-center">
            <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
              <span class="text-xl sm:text-2xl">📚</span>
            </div>
            <span class="text-sm font-medium text-white/90 line-clamp-1 px-2 max-w-full">
              {{ displayTitle }}
            </span>
            <span v-if="authorInitial" class="text-xs text-white/70 mt-1">
              {{ authorInitial }}
            </span>
          </div>
          
          <div v-else-if="type === 'avatar'" class="flex flex-col items-center">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span class="text-lg sm:text-xl font-bold">
                {{ titleInitial }}
              </span>
            </div>
          </div>
          
          <div v-else class="flex flex-col items-center">
            <span class="text-3xl sm:text-4xl mb-1">📖</span>
            <span class="text-xs text-white/80">
              {{ displayTitle }}
            </span>
          </div>
        </div>
        
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full"></div>
          <div class="absolute bottom-4 right-4 w-12 h-12 border border-white rounded-lg"></div>
          <div class="absolute top-1/2 right-8 w-4 h-4 bg-white rounded-full"></div>
        </div>
      </div>
    </Transition>
  </div>
</template>
