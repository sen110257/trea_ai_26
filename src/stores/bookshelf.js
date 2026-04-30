import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'bookshelf'

export const useBookshelfStore = defineStore('bookshelf', () => {
  const books = ref([])

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        books.value = JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load bookshelf:', e)
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books.value))
    } catch (e) {
      console.error('Failed to save bookshelf:', e)
    }
  }

  function isInShelf(bookId) {
    return books.value.some(book => book.id === bookId)
  }

  function addBook(book) {
    if (isInShelf(book.id)) {
      return false
    }
    books.value.unshift({
      id: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      category: book.category,
      addedAt: Date.now(),
      lastReadAt: null,
      lastChapterId: null,
      lastChapterTitle: null,
      progress: 0
    })
    return true
  }

  function removeBook(bookId) {
    const index = books.value.findIndex(book => book.id === bookId)
    if (index > -1) {
      books.value.splice(index, 1)
      return true
    }
    return false
  }

  function updateProgress(bookId, chapterId, chapterTitle, progress = 0) {
    const book = books.value.find(b => b.id === bookId)
    if (book) {
      book.lastReadAt = Date.now()
      book.lastChapterId = chapterId
      book.lastChapterTitle = chapterTitle
      book.progress = progress
    }
  }

  function clear() {
    books.value = []
  }

  loadFromStorage()

  watch(books, () => {
    saveToStorage()
  }, { deep: true })

  return {
    books,
    isInShelf,
    addBook,
    removeBook,
    updateProgress,
    clear
  }
})
