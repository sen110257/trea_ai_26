<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FallbackImage from '@/components/FallbackImage.vue'
import { useBookshelfStore } from '@/stores/bookshelf'
import { useHistoryStore } from '@/stores/history'

const router = useRouter()
const bookshelfStore = useBookshelfStore()
const historyStore = useHistoryStore()

const showConfirmClear = ref(false)
const isLoading = ref(false)

function goToBook(bookId) {
  const lastRead = historyStore.getLastRead(bookId)
  if (lastRead) {
    router.push(`/read/${bookId}/${lastRead.chapterId}`)
  } else {
    router.push(`/book/${bookId}`)
  }
}

function goToBookDetail(bookId, event) {
  event.stopPropagation()
  router.push(`/book/${bookId}`)
}

function removeFromShelf(bookId, event) {
  event.stopPropagation()
  bookshelfStore.removeBook(bookId)
}

function clearShelf() {
  isLoading.value = true
  setTimeout(() => {
    bookshelfStore.clear()
    showConfirmClear.value = false
    isLoading.value = false
  }, 300)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 py-8 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
          📚 我的书架
        </h1>
        <p class="text-white/80 text-sm sm:text-base">
          收藏的小说共 {{ bookshelfStore.books.length }} 本
        </p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="bookshelfStore.books.length > 0" class="flex justify-end mb-6">
        <button 
          @click="showConfirmClear = true"
          class="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          清空书架
        </button>
      </div>

      <div v-if="bookshelfStore.books.length > 0" class="space-y-4">
        <div 
          v-for="book in bookshelfStore.books" 
          :key="book.id"
          class="bg-white rounded-2xl shadow-soft hover:shadow-card transition-all duration-300 p-5 cursor-pointer group"
          @click="goToBook(book.id)"
        >
          <div class="flex gap-4 sm:gap-6">
            <div class="relative flex-shrink-0">
              <div class="w-24 h-36 sm:w-28 sm:h-40 rounded-xl overflow-hidden shadow-md">
                <FallbackImage
                  :src="book.cover"
                  :alt="book.title"
                  :title="book.title"
                  :author="book.author"
                  type="cover"
                />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <h3 class="font-semibold text-gray-800 text-lg line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {{ book.title }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">{{ book.author }}</p>
                  <span class="inline-block px-2.5 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-md mt-2">
                    {{ book.category }}
                  </span>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                  <button 
                    @click="goToBookDetail(book.id, $event)"
                    class="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="查看详情"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>
                  <button 
                    @click="removeFromShelf(book.id, $event)"
                    class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="移除书架"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="mt-4 p-3 bg-gray-50 rounded-xl">
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-gray-500">阅读进度</span>
                  <span 
                    v-if="book.lastChapterTitle" 
                    class="text-gray-700 font-medium line-clamp-1"
                  >
                    {{ book.lastChapterTitle }}
                  </span>
                  <span v-else class="text-gray-400">
                    尚未开始
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${book.progress || 0}%` }"
                  ></div>
                </div>
              </div>

              <div class="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span v-if="book.addedAt">
                  加入于 {{ new Date(book.addedAt).toLocaleDateString() }}
                </span>
                <span v-if="book.lastReadAt">
                  最后阅读于 {{ new Date(book.lastReadAt).toLocaleDateString() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <div class="text-7xl mb-6">📖</div>
        <h3 class="text-xl font-medium text-gray-700 mb-3">书架空空如也</h3>
        <p class="text-gray-500 mb-8">快去发现你喜欢的小说吧~</p>
        <button 
          @click="router.push('/')"
          class="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-200 transition-all duration-200"
        >
          去逛逛
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="showConfirmClear"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          @click.self="showConfirmClear = false"
        >
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="scale-95 opacity-0"
            enter-to-class="scale-100 opacity-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="scale-100 opacity-100"
            leave-to-class="scale-95 opacity-0"
          >
            <div v-if="showConfirmClear" class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
              <div class="text-center mb-6">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span class="text-3xl">🗑️</span>
                </div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">确认清空书架？</h3>
                <p class="text-gray-500 text-sm">
                  此操作将移除书架中的所有小说，无法撤销
                </p>
              </div>

              <div class="flex gap-3">
                <button 
                  @click="showConfirmClear = false"
                  :disabled="isLoading"
                  class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  @click="clearShelf"
                  :disabled="isLoading"
                  class="flex-1 py-3 px-4 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg v-if="isLoading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>{{ isLoading ? '清空中...' : '确认清空' }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
