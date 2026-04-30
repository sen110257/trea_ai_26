<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useReadingSettingsStore } from '@/stores/readingSettings'
import { useHistoryStore } from '@/stores/history'
import { useBookshelfStore } from '@/stores/bookshelf'
import { useAnnotationsStore } from '@/stores/annotations'
import { getBookById } from '@/data/books'
import { 
  getChaptersByBook, 
  getChapterById, 
  getChapterIndex,
  getNextChapter,
  getPrevChapter,
  generateMoreChapters
} from '@/data/chapters'
import GiftSelector from '@/components/GiftSelector.vue'

const route = useRoute()
const router = useRouter()
const readingSettings = useReadingSettingsStore()
const historyStore = useHistoryStore()
const bookshelfStore = useBookshelfStore()
const annotationsStore = useAnnotationsStore()

const book = ref(null)
const chapters = ref([])
const currentChapter = ref(null)
const currentChapterIndex = ref(0)

const showSettings = ref(false)
const showChapterList = ref(false)
const showGiftSelector = ref(false)
const showAnnotationPanel = ref(false)

const isInShelf = ref(false)
const scrollProgress = ref(0)

const touchStartX = ref(0)
const touchStartY = ref(0)
const isSelecting = ref(false)

const chapterAnnotations = ref([])
const selectedText = ref('')
const showAnnotationPopup = ref(false)
const popupPosition = ref({ x: 0, y: 0 })

const themeColors = computed(() => readingSettings.getThemeColors())
const settings = computed(() => readingSettings.settings)

const chapterListPage = ref(1)
const chaptersPerPage = 50

const paginatedChapters = computed(() => {
  const start = (chapterListPage.value - 1) * chaptersPerPage
  const end = start + chaptersPerPage
  return chapters.value.slice(start, end)
})

const totalChapterPages = computed(() => {
  return Math.ceil(chapters.value.length / chaptersPerPage)
})

const isFirstChapter = computed(() => currentChapterIndex.value === 0)
const isLastChapter = computed(() => currentChapterIndex.value === chapters.value.length - 1)

function loadReader() {
  const bookId = route.params.bookId
  const chapterId = route.params.chapterId
  
  book.value = getBookById(bookId)
  if (!book.value) {
    router.push('/')
    return
  }
  
  chapters.value = getChaptersByBook(bookId)
  
  if (chapters.value.length < 20) {
    generateMoreChapters(bookId, 20 - chapters.value.length)
    chapters.value = getChaptersByBook(bookId)
  }
  
  currentChapter.value = getChapterById(bookId, chapterId)
  if (!currentChapter.value && chapters.value.length > 0) {
    currentChapter.value = chapters.value[0]
  }
  
  currentChapterIndex.value = getChapterIndex(bookId, currentChapter.value?.id)
  isInShelf.value = bookshelfStore.isInShelf(bookId)
  
  loadAnnotations()
  
  if (book.value && currentChapter.value) {
    historyStore.addToHistory(
      book.value,
      currentChapter.value.id,
      currentChapter.value.title
    )
  }
}

function loadAnnotations() {
  if (!book.value || !currentChapter.value) return
  chapterAnnotations.value = annotationsStore.getChapterAnnotations(
    book.value.id,
    currentChapter.value.id
  )
}

function goToPrevChapter() {
  if (!book.value || !currentChapter.value) return
  const prevChapter = getPrevChapter(book.value.id, currentChapter.value.id)
  if (prevChapter) {
    router.push(`/read/${book.value.id}/${prevChapter.id}`)
  }
}

function goToNextChapter() {
  if (!book.value || !currentChapter.value) return
  const nextChapter = getNextChapter(book.value.id, currentChapter.value.id)
  if (nextChapter) {
    router.push(`/read/${book.value.id}/${nextChapter.id}`)
  }
}

function goToChapter(chapterId) {
  if (!book.value) return
  showChapterList.value = false
  router.push(`/read/${book.value.id}/${chapterId}`)
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

function handleContentClick(event) {
  if (isSelecting.value) return
  
  const screenWidth = window.innerWidth
  const clickX = event.clientX
  
  if (clickX < screenWidth / 3) {
    goToPrevChapter()
  } else if (clickX > screenWidth * 2 / 3) {
    goToNextChapter()
  } else {
    showSettings.value = !showSettings.value
  }
}

function handleTouchStart(event) {
  touchStartX.value = event.touches[0].clientX
  touchStartY.value = event.touches[0].clientY
  isSelecting.value = false
}

function handleTouchMove(event) {
  const deltaX = Math.abs(event.touches[0].clientX - touchStartX.value)
  const deltaY = Math.abs(event.touches[0].clientY - touchStartY.value)
  
  if (deltaY > 10) {
    isSelecting.value = true
  }
}

function handleTouchEnd(event) {
  if (isSelecting.value) return
  
  const touchEndX = event.changedTouches[0].clientX
  const deltaX = touchEndX - touchStartX.value
  
  if (Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      goToPrevChapter()
    } else {
      goToNextChapter()
    }
  }
}

function handleWheel(event) {
  if (event.deltaY > 0 && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    goToNextChapter()
  }
}

function handleScroll() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  if (docHeight > 0) {
    scrollProgress.value = (scrollTop / docHeight) * 100
  }
}

function handleTextSelection() {
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    selectedText.value = selection.toString().trim()
    
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    popupPosition.value = {
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    }
    showAnnotationPopup.value = true
  } else {
    showAnnotationPopup.value = false
  }
}

function addAnnotation() {
  if (!book.value || !currentChapter.value || !selectedText.value) return
  
  annotationsStore.addAnnotation(
    book.value.id,
    currentChapter.value.id,
    selectedText.value,
    0,
    selectedText.value.length
  )
  
  window.getSelection()?.removeAllRanges()
  showAnnotationPopup.value = false
  loadAnnotations()
}

function deleteAnnotation(annotationId) {
  annotationsStore.deleteAnnotation(annotationId)
  loadAnnotations()
}

function goBack() {
  if (book.value) {
    router.push(`/book/${book.value.id}`)
  } else {
    router.back()
  }
}

watch(() => [route.params.bookId, route.params.chapterId], () => {
  loadReader()
  showSettings.value = false
  showChapterList.value = false
  window.scrollTo(0, 0)
  scrollProgress.value = 0
}, { deep: true })

onMounted(() => {
  loadReader()
  document.addEventListener('selectionchange', handleTextSelection)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', handleTextSelection)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div 
    class="min-h-screen transition-colors duration-500"
    :style="{ backgroundColor: themeColors.bg }"
    @wheel="handleWheel"
  >
    <div class="fixed top-0 left-0 right-0 z-50 h-1 pointer-events-none" :style="{ backgroundColor: themeColors.border }">
      <div 
        class="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-100"
        :style="{ width: scrollProgress + '%' }"
      ></div>
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
          v-if="showAnnotationPopup"
          class="fixed z-50 transform -translate-x-1/2 -translate-y-full"
          :style="{ left: popupPosition.x + 'px', top: popupPosition.y + 'px' }"
        >
          <div class="bg-gray-800 text-white rounded-xl shadow-2xl px-4 py-2 flex items-center gap-3">
            <button 
              @click="addAnnotation"
              class="flex items-center gap-1 text-sm hover:text-yellow-300 transition-colors"
            >
              <span>📝</span>
              标注
            </button>
            <button 
              @click="window.getSelection()?.removeAllRanges(); showAnnotationPopup = false"
              class="text-sm text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
          </div>
          <div class="w-3 h-3 bg-gray-800 transform rotate-45 mx-auto -mt-1.5"></div>
        </div>
      </Transition>
    </Teleport>

    <div 
      class="fixed top-16 left-4 z-40 flex flex-col gap-2"
      :style="{ opacity: showSettings ? 0 : 1, pointerEvents: showSettings ? 'none' : 'auto' }"
    >
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="-translate-x-10 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
      >
        <button 
          v-if="!isFirstChapter"
          @click="goToPrevChapter"
          class="w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          :style="{ 
            backgroundColor: themeColors.cardBg + 'f0', 
            color: themeColors.text,
            backdropFilter: 'blur(10px)'
          }"
          title="上一章"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      </Transition>

      <Transition
        enter-active-class="transition-all duration-300 ease-out delay-100"
        enter-from-class="-translate-x-10 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
      >
        <button 
          @click="showChapterList = true"
          class="w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          :style="{ 
            backgroundColor: themeColors.cardBg + 'f0', 
            color: themeColors.text,
            backdropFilter: 'blur(10px)'
          }"
          title="目录"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </Transition>
    </div>

    <div 
      class="fixed top-16 right-4 z-40 flex flex-col gap-2"
      :style="{ opacity: showSettings ? 0 : 1, pointerEvents: showSettings ? 'none' : 'auto' }"
    >
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="translate-x-10 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
      >
        <button 
          v-if="!isLastChapter"
          @click="goToNextChapter"
          class="w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          :style="{ 
            backgroundColor: themeColors.cardBg + 'f0', 
            color: themeColors.text,
            backdropFilter: 'blur(10px)'
          }"
          title="下一章"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </Transition>

      <Transition
        enter-active-class="transition-all duration-300 ease-out delay-100"
        enter-from-class="translate-x-10 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
      >
        <button 
          @click="showSettings = !showSettings"
          class="w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          :style="{ 
            backgroundColor: themeColors.cardBg + 'f0', 
            color: themeColors.text,
            backdropFilter: 'blur(10px)'
          }"
          title="设置"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </button>
      </Transition>
    </div>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="-translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-full opacity-0"
    >
      <header 
        v-if="showSettings"
        class="fixed top-0 left-0 right-0 z-40 backdrop-blur-md transition-colors duration-500"
        :style="{ backgroundColor: themeColors.cardBg + 'f5', borderBottom: `1px solid ${themeColors.border}` }"
      >
        <div class="flex items-center justify-between px-4 py-3 mt-1">
          <button 
            @click="goBack"
            class="flex items-center gap-2 transition-colors"
            :style="{ color: themeColors.text }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span class="text-sm font-medium">{{ book?.title }}</span>
          </button>
          
          <div class="flex items-center gap-2">
            <button 
              @click="toggleBookshelf"
              class="p-2 rounded-lg transition-colors hover:opacity-80"
              :class="isInShelf ? 'text-yellow-500' : ''"
              :style="{ color: isInShelf ? undefined : themeColors.text }"
              :title="isInShelf ? '已加入书架' : '加入书架'"
            >
              <span class="text-lg">{{ isInShelf ? '⭐' : '☆' }}</span>
            </button>
            <button 
              @click="showGiftSelector = true"
              class="p-2 rounded-lg transition-colors hover:opacity-80"
              :style="{ color: themeColors.text }"
              title="送礼物"
            >
              <span class="text-lg">🎁</span>
            </button>
          </div>
        </div>
      </header>
    </Transition>

    <main 
      class="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 cursor-pointer select-text"
      :style="{ 
        paddingLeft: settings.pageMargin + 'px',
        paddingRight: settings.pageMargin + 'px',
        maxWidth: '800px',
        margin: '0 auto'
      }"
      @click="handleContentClick"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div 
        class="h-px w-16 mx-auto mb-8"
        :style="{ background: `linear-gradient(to right, transparent, ${themeColors.text}40, transparent)` }"
      ></div>

      <div v-if="currentChapter" class="mb-10 text-center">
        <div 
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          :style="{ backgroundColor: themeColors.border + '80', color: themeColors.text + 'b3' }"
        >
          <span class="text-xs">📖</span>
          <span class="text-xs">{{ book?.title }}</span>
        </div>
        
        <h2 
          class="text-xl sm:text-2xl font-bold mb-3"
          :style="{ color: themeColors.text }"
        >
          {{ currentChapter.title }}
        </h2>
        
        <div class="flex items-center justify-center gap-2">
          <span 
            class="w-8 h-px"
            :style="{ backgroundColor: themeColors.text + '40' }"
          ></span>
          <p 
            class="text-sm"
            :style="{ color: themeColors.text + '99' }"
          >
            第 {{ currentChapterIndex + 1 }} 章 / 共 {{ chapters.length }} 章
          </p>
          <span 
            class="w-8 h-px"
            :style="{ backgroundColor: themeColors.text + '40' }"
          ></span>
        </div>
      </div>

      <div 
        class="whitespace-pre-wrap leading-relaxed text-justify"
        :style="{ 
          fontSize: settings.fontSize + 'px',
          lineHeight: settings.lineHeight,
          color: themeColors.text,
          fontFamily: 'var(--font-serif), serif',
          textIndent: '2em'
        }"
      >
        {{ currentChapter?.content || '' }}
      </div>

      <div 
        class="h-px w-24 mx-auto mt-12 mb-8"
        :style="{ background: `linear-gradient(to right, transparent, ${themeColors.text}40, transparent)` }"
      ></div>

      <div class="text-center mb-16">
        <p 
          class="text-sm"
          :style="{ color: themeColors.text + '80' }"
        >
          — 本章完 —
        </p>
        <div class="flex items-center justify-center gap-1.5 mt-3">
          <span 
            v-for="i in 5" 
            :key="i"
            class="w-1.5 h-1.5 rounded-full"
            :style="{ backgroundColor: themeColors.text + (60 - i * 10).toString(16).padStart(2, '0') }"
          ></span>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t" :style="{ borderColor: themeColors.border }">
        <div class="flex flex-col sm:flex-row gap-4">
          <button 
            v-if="!isFirstChapter"
            @click.stop="goToPrevChapter"
            class="flex-1 px-6 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            :style="{ 
              backgroundColor: themeColors.cardBg,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`
            }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span class="text-sm font-medium">上一章</span>
          </button>
          
          <button 
            @click.stop="showChapterList = true"
            class="px-6 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            :style="{ 
              backgroundColor: themeColors.cardBg,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`
            }"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <span class="text-sm font-medium">目录</span>
          </button>
          
          <button 
            v-if="!isLastChapter"
            @click.stop="goToNextChapter"
            class="flex-1 px-6 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            :style="{ 
              background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
              color: '#fff'
            }"
          >
            <span class="text-sm font-medium">下一章</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </main>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div 
        v-if="showSettings"
        class="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md rounded-t-3xl shadow-2xl"
        :style="{ backgroundColor: themeColors.cardBg + 'f8' }"
      >
        <div class="max-w-2xl mx-auto p-6 pb-10">
          <div class="flex items-center justify-center mb-6">
            <div class="w-12 h-1 rounded-full" :style="{ backgroundColor: themeColors.border }"></div>
          </div>

          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium flex items-center gap-2" :style="{ color: themeColors.text }">
                <span>🎨</span>
                阅读主题
              </span>
            </div>
            <div class="flex items-center justify-between gap-3 px-1">
              <button
                v-for="(themeColors, themeKey) in readingSettings.themes"
                :key="themeKey"
                @click="readingSettings.setTheme(themeKey)"
                class="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200"
                :class="settings.theme === themeKey ? 'ring-2 ring-purple-500 scale-105' : 'hover:scale-105'"
              >
                <div 
                  class="w-12 h-12 rounded-xl border-2 shadow-sm overflow-hidden"
                  :style="{ 
                    backgroundColor: themeColors.bg,
                    borderColor: settings.theme === themeKey ? '#8b5cf6' : themeColors.border
                  }"
                >
                  <div 
                    class="w-full h-full flex items-center justify-center"
                    :style="{ color: themeColors.text }"
                  >
                    <span class="text-xs font-medium">Aa</span>
                  </div>
                </div>
                <span 
                  class="text-xs"
                  :style="{ color: themeColors.text }"
                >
                  {{ themeKey === 'day' ? '日间' : themeKey === 'green' ? '护眼' : themeKey === 'night' ? '夜间' : '纸质' }}
                </span>
              </button>
            </div>
          </div>

          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium flex items-center gap-2" :style="{ color: themeColors.text }">
                <span>📝</span>
                字体大小
              </span>
              <span class="text-sm px-2 py-0.5 rounded" :style="{ backgroundColor: themeColors.border + '60', color: themeColors.text + 'b3' }">
                {{ settings.fontSize }}px
              </span>
            </div>
            <div class="flex items-center gap-4">
              <button 
                @click="readingSettings.setFontSize(settings.fontSize - 2)"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
                :style="{ backgroundColor: themeColors.bg, color: themeColors.text }"
              >
                -
              </button>
              <div class="flex-1">
                <input 
                  type="range" 
                  min="14" 
                  max="32" 
                  :value="settings.fontSize"
                  @input="readingSettings.setFontSize(parseInt($event.target.value))"
                  class="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style="background: linear-gradient(to right, #8b5cf6 0%, #8b5cf6 50%, #e5e7eb 50%, #e5e7eb 100%)"
                />
              </div>
              <button 
                @click="readingSettings.setFontSize(settings.fontSize + 2)"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
                :style="{ backgroundColor: themeColors.bg, color: themeColors.text }"
              >
                +
              </button>
            </div>
          </div>

          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium flex items-center gap-2" :style="{ color: themeColors.text }">
                <span>↕️</span>
                行间距
              </span>
              <span class="text-sm px-2 py-0.5 rounded" :style="{ backgroundColor: themeColors.border + '60', color: themeColors.text + 'b3' }">
                {{ settings.lineHeight }}
              </span>
            </div>
            <div class="flex items-center gap-4">
              <button 
                @click="readingSettings.setLineHeight(settings.lineHeight - 0.1)"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium"
                :style="{ backgroundColor: themeColors.bg, color: themeColors.text }"
              >
                紧
              </button>
              <div class="flex-1">
                <input 
                  type="range" 
                  min="1.4" 
                  max="2.5" 
                  step="0.1"
                  :value="settings.lineHeight"
                  @input="readingSettings.setLineHeight(parseFloat($event.target.value))"
                  class="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style="background: linear-gradient(to right, #8b5cf6 0%, #8b5cf6 50%, #e5e7eb 50%, #e5e7eb 100%)"
                />
              </div>
              <button 
                @click="readingSettings.setLineHeight(settings.lineHeight + 0.1)"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium"
                :style="{ backgroundColor: themeColors.bg, color: themeColors.text }"
              >
                松
              </button>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium flex items-center gap-2" :style="{ color: themeColors.text }">
                <span>⬅️</span>
                页边距
              </span>
              <span class="text-sm px-2 py-0.5 rounded" :style="{ backgroundColor: themeColors.border + '60', color: themeColors.text + 'b3' }">
                {{ settings.pageMargin }}px
              </span>
            </div>
            <div class="flex items-center gap-4">
              <button 
                @click="readingSettings.setPageMargin(settings.pageMargin - 8)"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium"
                :style="{ backgroundColor: themeColors.bg, color: themeColors.text }"
              >
                窄
              </button>
              <div class="flex-1">
                <input 
                  type="range" 
                  min="16" 
                  max="80" 
                  step="8"
                  :value="settings.pageMargin"
                  @input="readingSettings.setPageMargin(parseInt($event.target.value))"
                  class="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style="background: linear-gradient(to right, #8b5cf6 0%, #8b5cf6 50%, #e5e7eb 50%, #e5e7eb 100%)"
                />
              </div>
              <button 
                @click="readingSettings.setPageMargin(settings.pageMargin + 8)"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium"
                :style="{ backgroundColor: themeColors.bg, color: themeColors.text }"
              >
                宽
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div 
      v-if="chapterAnnotations.length > 0 && showSettings"
      class="fixed bottom-72 left-4 right-4 max-w-md mx-auto z-40"
    >
      <div 
        class="rounded-xl p-4 shadow-lg"
        :style="{ 
          backgroundColor: themeColors.cardBg,
          border: `1px solid ${themeColors.border}`
        }"
      >
        <h4 
          class="text-sm font-medium mb-2 flex items-center gap-2"
          :style="{ color: themeColors.text }"
        >
          <span>📝</span>
          本章标注 ({{ chapterAnnotations.length }})
        </h4>
        <div class="space-y-2 max-h-32 overflow-y-auto">
          <div 
            v-for="ann in chapterAnnotations" 
            :key="ann.id"
            class="flex items-start justify-between gap-2 p-2 rounded-lg"
            :style="{ backgroundColor: themeColors.bg }"
          >
            <p 
              class="text-sm flex-1 line-clamp-2"
              :style="{ color: themeColors.text }"
            >
              {{ ann.text }}
            </p>
            <button 
              @click.stop="deleteAnnotation(ann.id)"
              class="text-red-400 hover:text-red-500 text-xs flex-shrink-0"
            >
              删除
            </button>
          </div>
        </div>
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
          v-if="showChapterList"
          class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          @click="showChapterList = false"
        >
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="translate-x-full opacity-0"
            enter-to-class="translate-x-0 opacity-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="translate-x-0 opacity-100"
            leave-to-class="translate-x-full opacity-0"
          >
            <div 
              v-if="showChapterList"
              class="absolute right-0 top-0 bottom-0 w-full sm:w-96 shadow-2xl overflow-hidden"
              :style="{ backgroundColor: themeColors.cardBg }"
              @click.stop
            >
              <div 
                class="flex items-center justify-between px-6 py-4 border-b"
                :style="{ borderColor: themeColors.border }"
              >
                <div class="flex items-center gap-2">
                  <span>📚</span>
                  <h3 class="text-lg font-semibold" :style="{ color: themeColors.text }">
                    章节目录
                  </h3>
                </div>
                <button 
                  @click="showChapterList = false"
                  class="p-2 rounded-lg hover:opacity-80 transition-colors"
                  :style="{ color: themeColors.text }"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div 
                class="px-6 py-3 flex items-center justify-between border-b"
                :style="{ borderColor: themeColors.border }"
              >
                <p class="text-sm" :style="{ color: themeColors.text + '99' }">
                  共 {{ chapters.length }} 章
                </p>
                <p class="text-sm" :style="{ color: themeColors.text + '99' }">
                  当前: 第 {{ currentChapterIndex + 1 }} 章
                </p>
              </div>

              <div class="overflow-y-auto" style="height: calc(100vh - 120px)">
                <div class="px-4 py-2">
                  <button
                    v-for="(chapter, index) in paginatedChapters"
                    :key="chapter.id"
                    @click="goToChapter(chapter.id)"
                    class="w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 my-1 group"
                    :class="index + (chapterListPage - 1) * chaptersPerPage === currentChapterIndex 
                      ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700' 
                      : 'hover:bg-gray-50 text-gray-700'"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span 
                          class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          :class="index + (chapterListPage - 1) * chaptersPerPage === currentChapterIndex 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-100 text-gray-500'"
                        >
                          {{ index + 1 + (chapterListPage - 1) * chaptersPerPage }}
                        </span>
                        <span class="text-sm line-clamp-1">
                          {{ chapter.title }}
                        </span>
                      </div>
                      <div v-if="index + (chapterListPage - 1) * chaptersPerPage === currentChapterIndex" class="flex items-center gap-1">
                        <span class="text-xs text-purple-600 font-medium">当前</span>
                        <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>

                <div v-if="totalChapterPages > 1" class="flex items-center justify-center gap-2 px-4 py-4 border-t" :style="{ borderColor: themeColors.border }">
                  <button 
                    v-if="chapterListPage > 1"
                    @click="chapterListPage--"
                    class="px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                    :style="{ backgroundColor: themeColors.bg, color: themeColors.text }"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    上一页
                  </button>
                  <span 
                    class="text-sm px-3 py-1 rounded-full"
                    :style="{ backgroundColor: themeColors.border + '60', color: themeColors.text + 'b3' }"
                  >
                    {{ chapterListPage }} / {{ totalChapterPages }}
                  </span>
                  <button 
                    v-if="chapterListPage < totalChapterPages"
                    @click="chapterListPage++"
                    class="px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                    :style="{ backgroundColor: themeColors.bg, color: themeColors.text }"
                  >
                    下一页
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <GiftSelector
      v-if="book"
      :book-id="book.id"
      :chapter-id="currentChapter?.id"
      :show="showGiftSelector"
      @close="showGiftSelector = false"
      @sent="() => { showGiftSelector = false; showSettings = false }"
    />
  </div>
</template>
