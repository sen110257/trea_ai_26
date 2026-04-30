<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuthorById } from '@/data/authors'
import { getBooksByAuthor } from '@/data/books'
import BookCard from '@/components/BookCard.vue'

const route = useRoute()
const router = useRouter()

const author = ref(null)
const authorBooks = ref([])

function loadAuthor() {
  const authorId = route.params.id
  author.value = getAuthorById(authorId)
  
  if (!author.value) {
    router.push('/')
    return
  }
  
  authorBooks.value = getBooksByAuthor(authorId)
}

function renderStars(rating) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const stars = []
  
  for (let i = 0; i < fullStars; i++) {
    stars.push('⭐')
  }
  if (hasHalfStar) {
    stars.push('✦')
  }
  const emptyStars = 5 - stars.length
  for (let i = 0; i < emptyStars; i++) {
    stars.push('☆')
  }
  
  return stars.join('')
}

watch(() => route.params.id, () => {
  loadAuthor()
})

onMounted(() => {
  loadAuthor()
})
</script>

<template>
  <div v-if="author" class="min-h-screen bg-gray-50">
    <div class="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div class="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <div class="relative">
            <img 
              :src="author.avatar" 
              :alt="author.name"
              class="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover shadow-2xl ring-4 ring-white/30"
            />
            <div class="absolute -bottom-2 -right-2 px-3 py-1 bg-white rounded-full shadow-lg">
              <span class="text-sm font-medium text-purple-600">作家</span>
            </div>
          </div>

          <div class="text-center sm:text-left flex-1">
            <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2">
              {{ author.name }}
            </h1>
            
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-white/90 mb-4">
              <div class="flex items-center gap-1">
                <span class="text-yellow-300">{{ renderStars(author.rating) }}</span>
                <span class="font-medium">{{ author.rating }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span>👥</span>
                <span>{{ (author.followers / 10000).toFixed(1) }}万粉丝</span>
              </div>
              <div class="flex items-center gap-1">
                <span>📅</span>
                <span>入驻于 {{ author.joinedAt }}</span>
              </div>
            </div>

            <p class="text-white/80 max-w-2xl leading-relaxed">
              {{ author.bio }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl shadow-soft p-5 text-center">
          <div class="text-2xl font-bold text-purple-600">{{ authorBooks.length }}</div>
          <div class="text-sm text-gray-500 mt-1">作品数量</div>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5 text-center">
          <div class="text-2xl font-bold text-indigo-600">{{ author.rating }}</div>
          <div class="text-sm text-gray-500 mt-1">平均评分</div>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5 text-center">
          <div class="text-2xl font-bold text-blue-600">{{ (author.ratingCount / 10000).toFixed(1) }}万</div>
          <div class="text-sm text-gray-500 mt-1">累计评价</div>
        </div>
        <div class="bg-white rounded-2xl shadow-soft p-5 text-center">
          <div class="text-2xl font-bold text-green-600">{{ (author.followers / 10000).toFixed(1) }}万</div>
          <div class="text-sm text-gray-500 mt-1">粉丝数</div>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>📚</span>
        全部作品
        <span class="text-sm font-normal text-gray-400">({{ authorBooks.length }}本)</span>
      </h2>

      <div v-if="authorBooks.length > 0" class="space-y-4">
        <div 
          v-for="book in authorBooks" 
          :key="book.id"
          class="group cursor-pointer bg-white rounded-2xl shadow-soft hover:shadow-card transition-all duration-300 p-5 sm:p-6"
          @click="router.push(`/book/${book.id}`)"
        >
          <div class="flex gap-4 sm:gap-6">
            <img 
              :src="book.cover" 
              :alt="book.title"
              class="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-xl shadow-md flex-shrink-0 group-hover:shadow-lg transition-shadow"
            />
            
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-800 text-lg line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {{ book.title }}
                  </h3>
                  <div class="flex flex-wrap items-center gap-2 mt-2">
                    <span class="px-2.5 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-md">
                      {{ book.categoryName }}
                    </span>
                    <span class="px-2.5 py-0.5 text-xs rounded-md"
                      :class="book.status === '已完结' 
                        ? 'bg-green-50 text-green-600' 
                        : 'bg-blue-50 text-blue-600'"
                    >
                      {{ book.status }}
                    </span>
                  </div>
                </div>
              </div>

              <p class="text-sm text-gray-500 mt-3 line-clamp-2">
                {{ book.description }}
              </p>

              <div class="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                <span class="flex items-center gap-1">
                  <span class="text-yellow-500">⭐</span>
                  {{ book.rating }}
                </span>
                <span class="flex items-center gap-1">
                  <span>👁️</span>
                  {{ (book.views / 10000).toFixed(0) }}万人气
                </span>
                <span class="flex items-center gap-1">
                  <span>❤️</span>
                  {{ (book.favorites / 1000).toFixed(0) }}千收藏
                </span>
                <span class="flex items-center gap-1">
                  <span>📄</span>
                  {{ book.chapterCount }}章
                </span>
              </div>

              <div class="flex flex-wrap gap-1.5 mt-3">
                <span 
                  v-for="tag in book.tags.slice(0, 4)" 
                  :key="tag"
                  class="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="hidden sm:flex items-center">
              <svg class="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16">
        <div class="text-6xl mb-4">📖</div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">暂无作品</h3>
        <p class="text-gray-500">期待作者的新作~</p>
      </div>
    </div>
  </div>

  <div v-else class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="loading-spinner mx-auto mb-4"></div>
      <p class="text-gray-500">加载中...</p>
    </div>
  </div>
</template>
