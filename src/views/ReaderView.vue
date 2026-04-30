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
const readingProgress = ref(0)

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
}, { deep: true })

onMounted(() => {
  loadReader()
  document.addEventListener('selectionchange', handleTextSelection)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', handleTextSelection)
})
</script>

<template>
  <div 
    class="min-h-screen transition-colors duration-500"
    :style="{ backgroundColor: themeColors.bg }"
    @wheel="handleWheel"
  >
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
        :style="{ backgroundColor: themeColors.bg + 'e6', borderBottom: `1px solid ${themeColors.border}` }"
      >
        <div class="flex items-center justify-between px-4 py-3">
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
              @click="showChapterList = true"
              class="p-2 rounded-lg transition-colors hover:opacity-80"
              :style="{ color: themeColors.text }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <button 
              @click="toggleBookshelf"
              class="p-2 rounded-lg transition-colors hover:opacity-80"
              :class="isInShelf ? 'text-yellow-500' : ''"
              :style="{ color: isInShelf ? undefined : themeColors.text }"
            >
              <span class="text-lg">{{ isInShelf ? '⭐' : '☆' }}</span>
            </button>
            <button 
              @click="showGiftSelector = true"
              class="p-2 rounded-lg transition-colors hover:opacity-80"
              :style="{ color: themeColors.text }"
            >
              <span class="text-lg">🎁</span>
            </button>
          </div>
        </div>
      </header>
    </Transition>

    <main 
      class="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 cursor-pointer select-text"
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
      <div v-if="currentChapter" class="mb-8 text-center">
        <h2 
          class="text-xl sm:text-2xl font-bold mb-2"
          :style="{ color: themeColors.text }"
        >
          {{ currentChapter.title }}
        </h2>
        <p 
          class="text-sm"
          :style="{ color: themeColors.text + '99' }"
        >
          第 {{ currentChapterIndex + 1 }} 章 / 共 {{ chapters.length }} 章
        </p>
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

      <div class="mt-12 pt-8 border-t" :style="{ borderColor: themeColors.border }">
        <div class="flex justify-between">
          <button 
            v-if="currentChapterIndex > 0"
            @click.stop="goToPrevChapter"
            class="px-6 py-3 rounded-xl transition-all duration-200"
            :style="{ 
              backgroundColor: themeColors.cardBg,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`
            }"
          >
            <span class="text-sm">上一章</span>
          </button>
          
          <div class="flex-1"></div>
          
          <button 
            v-if="currentChapterIndex < chapters.length - 1"
            @click.stop="goToNextChapter"
            class="px-6 py-3 rounded-xl transition-all duration-200"
            :style="{ 
              backgroundColor: themeColors.cardBg,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`
            }"
          >
            <span class="text-sm">下一章</span>
          </button>
        </div>
      </div>
    </main>

    <div 
      v-if="chapterAnnotations.length > 0 && showSettings"
      class="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40"
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
              class="text-red-400 hover:text-red-500 text-xs"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

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
        :style="{ backgroundColor: themeColors.cardBg + 'f0' }"
      >
        <div class="max-w-2xl mx-auto p-6">
          <div class="flex items-center justify-center mb-6">
            <div class="w-12 h-1 rounded-full" :style="{ backgroundColor: themeColors.border }"></div>
          </div>

          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium" :style="{ color: themeColors.text }">阅读主题</span>
            </div>
            <div class="flex items-center gap-3">
              <button
                v-for="(themeColors, themeKey) in readingSettings.themes"
                :key="themeKey"
                @click="readingSettings.setTheme(themeKey)"
                class="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200"
                :class="settings.theme === themeKey ? 'ring-2 ring-purple-500' : ''"
              >
                <div 
                  class="w-12 h-12 rounded-xl border shadow-sm"
                  :style="{ 
                    backgroundColor: themeColors.bg,
                    borderColor: themeColors.border
                  }"
                >
                  <div 
                    class="w-full h-full flex items-center justify-center"
                    :style="{ color: themeColors.text }"
                  >
                    <span class="text-xs">Aa</span>
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
              <span class="text-sm font-medium" :style="{ color: themeColors.text }">字体大小</span>
              <span class="text-sm" :style="{ color: themeColors.text + '99' }">{{ settings.fontSize }}px</span>
            </div>
            <div class="flex items-center gap-4">
              <button 
                @click="readingSettings.setFontSize(settings.fontSize - 2)"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
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
                class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                :style="{ backgroundColor: themeColors.bg, color: themeColors.text }"
              >
                +
              </button>
            </div>
          </div>

          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium" :style="{ color: themeColors.text }">行间距</span>
              <span class="text-sm" :style="{ color: themeColors.text + '99' }">{{ settings.lineHeight }}</span>
            </div>
            <div class="flex items-center gap-4">
              <button 
                @click="readingSettings.setLineHeight(settings.lineHeight - 0.1)"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
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
                class="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
                :style="{ backgroundColor: themeColors.bg, color: themeColors.text }"
              >
                松
              </button>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium" :style="{ color: themeColors.text }">页边距</span>
              <span class="text-sm" :style="{ color: themeColors.text + '99' }">{{ settings.pageMargin }}px</span>
            </div>
            <div class="flex items-center gap-4">
              <button 
                @click="readingSettings.setPageMargin(settings.pageMargin - 8)"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
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
                class="w-10 h-10 rounded-xl flex items-center justify-center text-sm"
                :style="{ backgroundColor: themeColors.bg, color: themeColors.text }"
              >
                宽
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

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
                <h3 class="text-lg font-semibold" :style="{ color: themeColors.text }">
                  章节目录
                </h3>
                <button 
                  @click="showChapterList = false"
                  class="p-2 rounded-lg hover:opacity-80"
                  :style="{ color: themeColors.text }"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div class="px-6 py-3 text-sm" :style="{ color: themeColors.text + '99' }">
                共 {{ chapters.length }} 章 · 当前第 {{ currentChapterIndex + 1 }} 章
              </div>

              <div class="overflow-y-auto" style="height: calc(100vh - 140px)">
                <div class="px-4">
                  <button
                    v-for="(chapter, index) in paginatedChapters"
                    :key="chapter.id"
                    @click="goToChapter(chapter.id)"
                    class="w-full text-left px-4 py-3 rounded-xl transition-colors my-1"
                    :class="index === currentChapterIndex ? 'bg-purple-100 text-purple-700' : ''"
                    :style="index !== currentChapterIndex ? { color: themeColors.text } : {}"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-sm line-clamp-1">
                        第{{ index + 1 + (chapterListPage - 1) * chaptersPerPage }}章 {{ chapter.title }}
                      </span>
                      <span v-if="index === currentChapterIndex" class="text-xs text-purple-500">
                        当前
                      </span>
                    </div>
                  </button>
                </div>

                <div v-if="totalChapterPages > 1" class="flex items-center justify-center gap-2 px-4 py-4">
                  <button 
                    v-if="chapterListPage > 1"
                    @click="chapterListPage--"
                    class="px-3 py-1.5 rounded-lg text-sm"
                    :style="{ backgroundColor: themeColors.bg, color: themeColors.text }"
                  >
                    上一页
                  </button>
                  <span 
                    class="text-sm"
                    :style="{ color: themeColors.text + '99' }"
                  >
                    {{ chapterListPage }} / {{ totalChapterPages }}
                  </span>
                  <button 
                    v-if="chapterListPage < totalChapterPages"
                    @click="chapterListPage++"
                    class="px-3 py-1.5 rounded-lg text-sm"
                    :style="{ backgroundColor: themeColors.bg, color: themeColors.text }"
                  >
                    下一页
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
