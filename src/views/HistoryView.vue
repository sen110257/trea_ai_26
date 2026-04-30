<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHistoryStore } from '@/stores/history'

const router = useRouter()
const historyStore = useHistoryStore()

const showConfirmClear = ref(false)
const isLoading = ref(false)

function formatTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`
  } else {
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
}

function continueReading(item) {
  router.push(`/read/${item.bookId}/${item.chapterId}`)
}

function goToBookDetail(bookId, event) {
  event.stopPropagation()
  router.push(`/book/${bookId}`)
}

function removeFromHistory(bookId, event) {
  event.stopPropagation()
  historyStore.removeFromHistory(bookId)
}

function clearHistory() {
  isLoading.value = true
  setTimeout(() => {
    historyStore.clearHistory()
    showConfirmClear.value = false
    isLoading.value = false
  }, 300)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="bg-gradient-to-r from-indigo-600 to-blue-600 py-8 px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-2xl sm:text-3xl font-bold text-white mb-2">
          ⏰ 阅读历史
        </h1>
        <p class="text-white/80 text-sm sm:text-base">
          共 {{ historyStore.history.length }} 条阅读记录
        </p>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="historyStore.history.length > 0" class="flex justify-end mb-6">
        <button 
          @click="showConfirmClear = true"
          class="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          清空历史
        </button>
      </div>

      <div v-if="historyStore.history.length > 0" class="space-y-4">
        <div 
          v-for="item in historyStore.history" 
          :key="item.bookId"
          class="bg-white rounded-2xl shadow-soft hover:shadow-card transition-all duration-300 p-5 cursor-pointer group"
          @click="continueReading(item)"
        >
          <div class="flex gap-4 sm:gap-6">
            <div class="relative flex-shrink-0">
              <img 
                :src="item.cover" 
                :alt="item.title"
                class="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-xl shadow-md"
              />
              <div class="absolute -bottom-2 -right-2 px-2 py-1 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs rounded-lg shadow-md">
                继续阅读
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <h3 class="font-semibold text-gray-800 text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {{ item.title }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">{{ item.author }}</p>
                  <span class="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-md mt-2">
                    {{ item.category }}
                  </span>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                  <button 
                    @click="goToBookDetail(item.bookId, $event)"
                    class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="查看详情"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>
                  <button 
                    @click="removeFromHistory(item.bookId, $event)"
                    class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除记录"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-indigo-600 font-medium flex items-center gap-1">
                    <span>📖</span>
                    上次读到
                  </span>
                  <span class="text-gray-500">{{ formatTime(item.readAt) }}</span>
                </div>
                <p class="text-gray-700 line-clamp-1">
                  {{ item.chapterTitle || '第1章' }}
                </p>
              </div>

              <div class="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span>
                  阅读于 {{ new Date(item.readAt).toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <div class="text-7xl mb-6">📚</div>
        <h3 class="text-xl font-medium text-gray-700 mb-3">暂无阅读记录</h3>
        <p class="text-gray-500 mb-8">快去开始你的阅读之旅吧~</p>
        <button 
          @click="router.push('/')"
          class="px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-blue-600 shadow-lg shadow-indigo-200 transition-all duration-200"
        >
          去发现好书
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
                <h3 class="text-lg font-semibold text-gray-800 mb-2">确认清空历史？</h3>
                <p class="text-gray-500 text-sm">
                  此操作将清除所有阅读历史记录，无法撤销
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
                  @click="clearHistory"
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
