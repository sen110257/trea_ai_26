<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import FallbackImage from '@/components/FallbackImage.vue'
import { 
  books, 
  categories,
  getTopBooksByViews,
  getTopBooksByFavorites,
  getTopBooksByRating,
  getLatestBooks
} from '@/data/books'
import { getAuthorsByRating, getAuthorsByFollowers } from '@/data/authors'
import { useGiftsStore } from '@/stores/gifts'

const router = useRouter()
const giftsStore = useGiftsStore()

const activeTab = ref('views')

const tabs = [
  { id: 'views', name: '人气榜', icon: '🔥' },
  { id: 'favorites', name: '收藏榜', icon: '❤️' },
  { id: 'rating', name: '评分榜', icon: '⭐' },
  { id: 'latest', name: '新书榜', icon: '📚' },
  { id: 'authors', name: '作者榜', icon: '✍️' },
  { id: 'gifts', name: '礼物榜', icon: '🎁' }
]

function getRankData() {
  switch (activeTab.value) {
    case 'views':
      return getTopBooksByViews(15)
    case 'favorites':
      return getTopBooksByFavorites(15)
    case 'rating':
      return getTopBooksByRating(15)
    case 'latest':
      return getLatestBooks(15)
    case 'authors':
      return getAuthorsByFollowers(15)
    case 'gifts':
      const giftRanks = giftsStore.getTopBooksByGifts(15)
      return giftRanks.map(gr => {
        const book = books.find(b => b.id === gr.bookId)
        return book ? { ...book, giftCount: gr.totalGifts } : null
      }).filter(Boolean)
    default:
      return []
  }
}

function goToDetail(item) {
  if (item.authorId) {
    router.push(`/book/${item.id}`)
  } else {
    router.push(`/author/${item.id}`)
  }
}

function getRankBadgeColor(index) {
  if (index === 0) return 'bg-gradient-to-br from-yellow-400 to-orange-500'
  if (index === 1) return 'bg-gradient-to-br from-gray-300 to-gray-400'
  if (index === 2) return 'bg-gradient-to-br from-amber-600 to-amber-700'
  return 'bg-gray-200 text-gray-600'
}

const rankData = computed(() => getRankData())
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 py-8 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
          🏆 排行榜
        </h1>
        <p class="text-white/80 text-sm sm:text-base">
          发现最受欢迎的优质作品
        </p>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 -mt-6">
      <div class="bg-white rounded-2xl shadow-card p-2 overflow-x-auto">
        <div class="flex gap-1 min-w-max">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200"
            :class="activeTab === tab.id 
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-200' 
              : 'text-gray-600 hover:bg-gray-50'"
          >
            <span>{{ tab.icon }}</span>
            <span>{{ tab.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 py-8">
      <div v-if="rankData.length > 0" class="space-y-3">
        <div 
          v-for="(item, index) in rankData" 
          :key="item.id"
          class="group cursor-pointer bg-white rounded-xl shadow-soft hover:shadow-card transition-all duration-300 p-4 sm:p-5"
          @click="goToDetail(item)"
        >
          <div class="flex gap-4 sm:gap-5">
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              :class="getRankBadgeColor(index)"
            >
              <span class="text-sm font-bold" :class="index < 3 ? 'text-white' : ''">
                {{ index + 1 }}
              </span>
            </div>

            <div 
              v-if="item.cover"
              class="w-16 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden shadow-md flex-shrink-0 group-hover:shadow-lg transition-shadow"
            >
              <FallbackImage
                :src="item.cover"
                :alt="item.title"
                :title="item.title"
                :author="item.author"
                type="cover"
              />
            </div>
            
            <div v-else class="w-16 h-24 sm:w-20 sm:h-28 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <FallbackImage
                :src="item.avatar"
                :alt="item.name"
                :title="item.name"
                type="avatar"
              />
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-800 text-base sm:text-lg line-clamp-1 group-hover:text-purple-600 transition-colors">
                {{ item.title || item.name }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                {{ item.author || item.bio?.substring(0, 30) + '...' }}
              </p>
              
              <div class="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
                <span v-if="item.rating" class="flex items-center gap-1 text-sm text-gray-600">
                  <span class="text-yellow-500">⭐</span>
                  {{ item.rating }}
                </span>
                <span v-if="item.views" class="flex items-center gap-1 text-sm text-gray-600">
                  <span>👁️</span>
                  {{ (item.views / 10000).toFixed(0) }}万
                </span>
                <span v-if="item.favorites" class="flex items-center gap-1 text-sm text-gray-600">
                  <span>❤️</span>
                  {{ (item.favorites / 1000).toFixed(0) }}千
                </span>
                <span v-if="item.followers" class="flex items-center gap-1 text-sm text-gray-600">
                  <span>👥</span>
                  {{ (item.followers / 10000).toFixed(1) }}万粉丝
                </span>
                <span v-if="item.giftCount" class="flex items-center gap-1 text-sm text-purple-600">
                  <span>🎁</span>
                  {{ item.giftCount }} 个礼物
                </span>
                <span v-if="item.categoryName" class="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-md">
                  {{ item.categoryName }}
                </span>
                <span v-if="item.status" class="px-2 py-0.5 text-xs rounded-md"
                  :class="item.status === '已完结' 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-purple-50 text-purple-600'"
                >
                  {{ item.status }}
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
        <div class="text-6xl mb-4">📊</div>
        <h3 class="text-lg font-medium text-gray-700 mb-2">暂无排行数据</h3>
        <p class="text-gray-500">快去送礼物支持你喜欢的小说吧~</p>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 pb-12">
      <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>📂</span>
        分类排行榜
      </h2>
      
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="cat in categories.filter(c => c.id !== 'all')"
          :key="cat.id"
          class="group cursor-pointer bg-white rounded-xl shadow-soft hover:shadow-card p-4 transition-all duration-300"
          @click="router.push('/')"
        >
          <h3 class="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
            {{ cat.name }}榜
          </h3>
          <p class="text-sm text-gray-400 mt-1">
            {{ books.filter(b => b.category === cat.id).length }} 本小说
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
