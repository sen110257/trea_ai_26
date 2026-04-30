<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  book: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'normal'
  }
})

const router = useRouter()

function goToDetail() {
  router.push(`/book/${props.book.id}`)
}

function getSizeClasses() {
  switch (props.size) {
    case 'small':
      return {
        wrapper: 'w-28 sm:w-32',
        image: 'h-40 sm:h-44',
        title: 'text-xs line-clamp-1',
        author: 'text-xs'
      }
    case 'large':
      return {
        wrapper: 'w-full',
        image: 'h-56 sm:h-64',
        title: 'text-lg font-semibold',
        author: 'text-sm'
      }
    default:
      return {
        wrapper: 'w-36 sm:w-40',
        image: 'h-52 sm:h-56',
        title: 'text-sm line-clamp-2',
        author: 'text-xs'
      }
  }
}

const sizeClasses = getSizeClasses()
</script>

<template>
  <div 
    :class="['group cursor-pointer', sizeClasses.wrapper]"
    @click="goToDetail"
  >
    <div class="relative overflow-hidden rounded-xl shadow-card group-hover:shadow-lg transition-all duration-300">
      <img 
        :src="book.cover" 
        :alt="book.title"
        :class="[
          'w-full object-cover transition-transform duration-500 group-hover:scale-105',
          sizeClasses.image
        ]"
        loading="lazy"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div class="absolute top-2 right-2">
        <span 
          v-if="book.status === '已完结'"
          class="px-2 py-0.5 bg-green-500/90 text-white text-xs rounded-full backdrop-blur-sm"
        >
          完结
        </span>
        <span 
          v-else
          class="px-2 py-0.5 bg-purple-500/90 text-white text-xs rounded-full backdrop-blur-sm"
        >
          连载
        </span>
      </div>

      <div class="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div class="flex items-center gap-2 text-white text-xs">
          <span class="flex items-center gap-1">
            <span>⭐</span>
            {{ book.rating }}
          </span>
          <span class="flex items-center gap-1">
            <span>👁️</span>
            {{ (book.views / 10000).toFixed(0) }}万
          </span>
        </div>
      </div>
    </div>
    
    <div class="mt-3 px-1">
      <h3 :class="['font-medium text-gray-800 group-hover:text-purple-600 transition-colors', sizeClasses.title]">
        {{ book.title }}
      </h3>
      <p :class="['text-gray-500 mt-1', sizeClasses.author]">
        {{ book.author }}
      </p>
      <div class="flex items-center gap-2 mt-1.5">
        <span class="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-md">
          {{ book.categoryName }}
        </span>
      </div>
    </div>
  </div>
</template>
