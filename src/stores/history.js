import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'reading_history'
const MAX_HISTORY = 100

export const useHistoryStore = defineStore('history', () => {
  const history = ref([])

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        history.value = JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load reading history:', e)
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
    } catch (e) {
      console.error('Failed to save reading history:', e)
    }
  }

  function addToHistory(book, chapterId, chapterTitle, position = 0) {
    const existingIndex = history.value.findIndex(item => item.bookId === book.id)
    
    const historyItem = {
      bookId: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      category: book.category,
      chapterId: chapterId,
      chapterTitle: chapterTitle,
      position: position,
      readAt: Date.now()
    }

    if (existingIndex > -1) {
      history.value.splice(existingIndex, 1)
    }
    
    history.value.unshift(historyItem)

    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }
  }

  function removeFromHistory(bookId) {
    const index = history.value.findIndex(item => item.bookId === bookId)
    if (index > -1) {
      history.value.splice(index, 1)
      return true
    }
    return false
  }

  function getLastRead(bookId) {
    return history.value.find(item => item.bookId === bookId)
  }

  function clearHistory() {
    history.value = []
  }

  loadFromStorage()

  watch(history, () => {
    saveToStorage()
  }, { deep: true })

  return {
    history,
    addToHistory,
    removeFromHistory,
    getLastRead,
    clearHistory
  }
})
