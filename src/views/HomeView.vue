<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BookCard from '@/components/BookCard.vue'
import FallbackImage from '@/components/FallbackImage.vue'
import { 
  books, 
  categories, 
  getFeaturedBooks, 
  getBooksByCategory, 
  searchBooks,
  getTopBooksByViews
} from '@/data/books'

const router = useRouter()

const searchKeyword = ref('')
const selectedCategory = ref('all')
const isSearchFocused = ref(false)
const featuredBooks = ref([])
const topBooks = ref([])

const displayBooks = computed(() => {
  if (searchKeyword.value.trim()) {
    return searchBooks(searchKeyword.value.trim())
  }
  return getBooksByCategory(selectedCategory.value)
})

function selectCategory(categoryId) {
  selectedCategory.value = categoryId
  searchKeyword.value = ''
}

function clearSearch() {
  searchKeyword.value = ''
}

function goToRank() {
  router.push('/rank')
}

onMounted(() => {
  featuredBooks.value = getFeaturedBooks()
  topBooks.value = getTopBooksByViews(8)
})
</script>

<template>
  <div class="min-h-screen">
    <div class="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 py-12 sm:py-16 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          发现你的下一本好书
        </h1>
        <p class="text-white/80 mb-8 text-sm sm:text-base">
          精选优质小说，给你沉浸式阅读体验
        </p>
        
        <div class="relative max-w-xl mx-auto">
          <div 
            class="flex items-center bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300"
            :class="isSearchFocused ? 'ring-4 ring-white/30' : ''"
          >
            <div class="pl-5 text-gray-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索书名、作者、标签..."
              class="flex-1 px-4 py-4 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
              @focus="isSearchFocused = true"
              @blur="isSearchFocused = false"
            />
            <button
              v-if="searchKeyword"
              @click="clearSearch"
              class="pr-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-wrap gap-2 justify-center">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="selectCategory(cat.id)"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
          :class="selectedCategory === cat.id 
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
            : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 shadow-sm'"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
      >
        <div v-if="searchKeyword" class="mb-6 p-4 bg-purple-50 rounded-xl">
          <p class="text-purple-700">
            搜索 "<span class="font-semibold">{{ searchKeyword }}</span>" 
            共找到 <span class="font-semibold">{{ displayBooks.length }}</span> 本小说
          </p>
        </div>
      </Transition>

      <div v-if="!searchKeyword && selectedCategory === 'all'" class="space-y-10">
        <section v-if="featuredBooks.length">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <span class="text-2xl">✨</span>
              <h2 class="text-xl sm:text-2xl font-bold text-gray-800">精选推荐</h2>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            <BookCard
              v-for="book in featuredBooks"
              :key="book.id"
              :book="book"
            />
          </div>
        </section>

        <section v-if="topBooks.length">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <span class="text-2xl">🔥</span>
              <h2 class="text-xl sm:text-2xl font-bold text-gray-800">热门榜单</h2>
            </div>
            <button 
              @click="goToRank"
              class="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              查看全部
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            <div 
              v-for="(book, index) in topBooks.slice(0, 4)" 
              :key="book.id"
              class="group cursor-pointer"
              @click="router.push(`/book/${book.id}`)"
            >
              <div class="relative flex gap-4 p-4 bg-white rounded-xl shadow-soft hover:shadow-card transition-all duration-300">
                <div class="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg z-10">
                  {{ index + 1 }}
                </div>
                <div class="w-16 h-24 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                  <FallbackImage
                    :src="book.cover"
                    :alt="book.title"
                    :title="book.title"
                    :author="book.author"
                    type="cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold text-gray-800 line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {{ book.title }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">{{ book.author }}</p>
                  <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span class="flex items-center gap-1">
                      <span>⭐</span>
                      <span class="font-medium">{{ book.rating }}</span>
                    </span>
                    <span class="flex items-center gap-1">
                      <span>👁️</span>
                      <span class="font-medium">{{ (book.views / 10000).toFixed(0) }}万</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div class="flex items-center gap-3 mb-6">
            <span class="text-2xl">📚</span>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-800">全部小说</h2>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            <BookCard
              v-for="book in displayBooks"
              :key="book.id"
              :book="book"
            />
          </div>
        </section>
      </div>

      <div v-else class="space-y-6">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          <BookCard
            v-for="book in displayBooks"
            :key="book.id"
            :book="book"
          />
        </div>
        
        <div v-if="displayBooks.length === 0" class="text-center py-16">
          <div class="text-6xl mb-4">📖</div>
          <h3 class="text-lg font-medium text-gray-700 mb-2">暂无小说</h3>
          <p class="text-gray-500">尝试其他关键词或分类</p>
        </div>
      </div>
    </div>
  </div>
</template>
