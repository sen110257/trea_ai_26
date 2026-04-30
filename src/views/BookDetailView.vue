<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookshelfStore } from '@/stores/bookshelf'
import { useGiftsStore } from '@/stores/gifts'
import { useHistoryStore } from '@/stores/history'
import { getBookById, getBooksByCategory } from '@/data/books'
import { getChaptersByBook, getChapterById, getChapterIndex, generateMoreChapters } from '@/data/chapters'
import BookCard from '@/components/BookCard.vue'
import GiftSelector from '@/components/GiftSelector.vue'

const route = useRoute()
const router = useRouter()
const bookshelfStore = useBookshelfStore()
const giftsStore = useGiftsStore()
const historyStore = useHistoryStore()

const book = ref(null)
const chapters = ref([])
const showChapters = ref(false)
const showGiftSelector = ref(false)
const isInShelf = ref(false)

const sameCategoryBooks = ref([])

const bookGiftCounts = computed(() => {
  if (!book.value) return {}
  return giftsStore.getBookGiftCounts(book.value.id)
})

const totalGifts = computed(() => {
  if (!book.value) return 0
  const counts = bookGiftCounts.value
  return Object.values(counts).reduce((sum, count) => sum + count, 0)
})

function loadBook() {
  const bookId = route.params.id
  book.value = getBookById(bookId)
  if (!book.value) {
    router.push('/')
    return
  }
  
  chapters.value = getChaptersByBook(bookId)
  isInShelf.value = bookshelfStore.isInShelf(bookId)
  
  if (chapters.value.length < 20) {
    generateMoreChapters(bookId, 20 - chapters.value.length)
    chapters.value = getChaptersByBook(bookId)
  }
  
  sameCategoryBooks.value = getBooksByCategory(book.value.category, 6).filter(b => b.id !== bookId)
}

function toggleBookshelf() {
  if (!book.value) return
  
  if (isInShelf.value) {
    bookshelfStore.removeBook(book.value.id)
  } else {
    bookshelfStore.addBook(book.value)
  }
  isInShelf.value = !isInShelf.value
}

function startReading() {
  if (!book.value || chapters.value.length === 0) return
  
  const lastRead = historyStore.getLastRead(book.value.id)
  
  if (lastRead) {
    router.push(`/read/${book.value.id}/${lastRead.chapterId}`)
  } else {
    router.push(`/read/${book.value.id}/${chapters.value[0].id}`)
  }
}

function readChapter(chapterId) {
  if (!book.value) return
  showChapters.value = false
  router.push(`/read/${book.value.id}/${chapterId}`)
}

function goToAuthor(authorId) {
  router.push(`/author/${authorId}`)
}

function openGiftSelector() {
  showGiftSelector.value = true
}

watch(() => route.params.id, () => {
  loadBook()
})

onMounted(() => {
  loadBook()
})
</script>

<template>
  <div v-if="book" class="min-h-screen bg-gray-50">
    <div class="relative">
      <div 
        class="absolute inset-0 bg-gradient-to-b from-purple-100/50 to-gray-50"
        :style="{ backgroundImage: `url(${book.cover})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1, filter: 'blur(40px)' }"
      />
      
      <div class="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div class="flex flex-col sm:flex-row gap-6 sm:gap-8">
          <div class="flex-shrink-0 mx-auto sm:mx-0">
            <div class="relative">
              <img 
                :src="book.cover" 
                :alt="book.title"
                class="w-40 sm:w-48 h-56 sm:h-64 object-cover rounded-2xl shadow-xl"
              />
              <div class="absolute -bottom-3 -right-3 px-3 py-1.5 bg-white rounded-full shadow-lg">
                <span class="text-sm font-medium" :class="book.status === '已完结' ? 'text-green-600' : 'text-purple-600'">
                  {{ book.status }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex-1 text-center sm:text-left">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              {{ book.title }}
            </h1>
            
            <button 
              @click="goToAuthor(book.authorId)"
              class="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors mb-4"
            >
              <span class="text-lg">✍️</span>
              <span>{{ book.author }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            <div class="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-6 mb-6">
              <div class="text-center">
                <div class="flex items-center justify-center gap-1">
                  <span class="text-yellow-500">⭐</span>
                  <span class="font-bold text-gray-800">{{ book.rating }}</span>
                </div>
                <p class="text-xs text-gray-500">{{ (book.ratingCount / 1000).toFixed(0) }}人评分</p>
              </div>
              <div class="text-center">
                <div class="font-bold text-gray-800">{{ (book.views / 10000).toFixed(0) }}万</div>
                <p class="text-xs text-gray-500">人气</p>
              </div>
              <div class="text-center">
                <div class="font-bold text-gray-800">{{ book.chapterCount }}章</div>
                <p class="text-xs text-gray-500">章节</p>
              </div>
              <div v-if="totalGifts > 0" class="text-center">
                <div class="font-bold text-purple-600">{{ totalGifts }}</div>
                <p class="text-xs text-gray-500">礼物</p>
              </div>
            </div>

            <div class="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
              <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {{ book.categoryName }}
              </span>
              <span 
                v-for="tag in book.tags" 
                :key="tag"
                class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
              >
                {{ tag }}
              </span>
            </div>

            <div class="flex flex-wrap justify-center sm:justify-start gap-3">
              <button 
                @click="startReading"
                class="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-200 transition-all duration-200 flex items-center gap-2"
              >
                <span>📖</span>
                立即阅读
              </button>
              <button 
                @click="toggleBookshelf"
                class="px-8 py-3 font-medium rounded-xl transition-all duration-200 flex items-center gap-2"
                :class="isInShelf 
                  ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm'"
              >
                <span>{{ isInShelf ? '✅' : '📚' }}</span>
                {{ isInShelf ? '已加入书架' : '加入书架' }}
              </button>
              <button 
                @click="openGiftSelector"
                class="px-6 py-3 bg-white text-purple-600 font-medium rounded-xl border border-purple-200 hover:bg-purple-50 shadow-sm transition-all duration-200 flex items-center gap-2"
              >
                <span>🎁</span>
                送礼物
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-2xl shadow-soft p-6 mb-8">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📝</span>
          简介
        </h2>
        <p class="text-gray-600 leading-relaxed">
          {{ book.description }}
        </p>
      </div>

      <div class="bg-white rounded-2xl shadow-soft overflow-hidden">
        <button 
          @click="showChapters = !showChapters"
          class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>📋</span>
            章节目录
            <span class="text-sm font-normal text-gray-400">({{ chapters.length }}章)</span>
          </h2>
          <svg 
            class="w-5 h-5 text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': showChapters }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-[600px] opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="max-h-[600px] opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-if="showChapters" class="border-t border-gray-100">
            <div class="max-h-[500px] overflow-y-auto">
              <div class="p-4 sm:p-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <button
                    v-for="(chapter, index) in chapters"
                    :key="chapter.id"
                    @click="readChapter(chapter.id)"
                    class="px-4 py-3 text-left rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-colors group"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-700 group-hover:text-purple-700">
                        第{{ index + 1 }}章 {{ chapter.title.replace('第' + (index + 1) + '章 ', '') }}
                      </span>
                      <svg class="w-4 h-4 text-gray-300 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ (chapter.wordCount / 1000).toFixed(1) }}千字
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <div v-if="sameCategoryBooks.length > 0" class="mt-8">
        <h2 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>📚</span>
          同类推荐
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          <BookCard
            v-for="b in sameCategoryBooks"
            :key="b.id"
            :book="b"
            size="small"
          />
        </div>
      </div>
    </div>

    <GiftSelector
      :book-id="book.id"
      :show="showGiftSelector"
      @close="showGiftSelector = false"
      @sent="() => {}"
    />
  </div>

  <div v-else class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="loading-spinner mx-auto mb-4"></div>
      <p class="text-gray-500">加载中...</p>
    </div>
  </div>
</template>
