import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'gifts'

const giftTypes = [
  { id: 'flower', name: '小花花', emoji: '🌸', price: 1, description: '送你一朵小花花' },
  { id: 'star', name: '小星星', emoji: '⭐', price: 2, description: '闪亮的小星星' },
  { id: 'chicken', name: '大鸡腿', emoji: '🍗', price: 5, description: '美味的大鸡腿' },
  { id: 'crown', name: '大皇冠', emoji: '👑', price: 10, description: '尊贵的大皇冠' }
]

export const useGiftsStore = defineStore('gifts', () => {
  const gifts = ref([])

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        gifts.value = JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load gifts:', e)
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gifts.value))
    } catch (e) {
      console.error('Failed to save gifts:', e)
    }
  }

  function sendGift(bookId, chapterId, giftType, message = '') {
    const gift = {
      id: Date.now().toString(),
      bookId: bookId,
      chapterId: chapterId || null,
      giftType: giftType.id,
      giftName: giftType.name,
      giftEmoji: giftType.emoji,
      message: message,
      sentAt: Date.now()
    }
    
    gifts.value.push(gift)
    return gift
  }

  function getBookGifts(bookId) {
    return gifts.value.filter(gift => gift.bookId === bookId)
  }

  function getChapterGifts(bookId, chapterId) {
    return gifts.value.filter(gift => gift.bookId === bookId && gift.chapterId === chapterId)
  }

  function getBookGiftCounts(bookId) {
    const bookGifts = getBookGifts(bookId)
    const counts = {}
    giftTypes.forEach(gift => {
      counts[gift.id] = bookGifts.filter(g => g.giftType === gift.id).length
    })
    return counts
  }

  function getTopBooksByGifts(limit = 10) {
    const bookGiftMap = {}
    
    gifts.value.forEach(gift => {
      if (!bookGiftMap[gift.bookId]) {
        bookGiftMap[gift.bookId] = {
          bookId: gift.bookId,
          totalGifts: 0,
          giftCounts: {}
        }
      }
      bookGiftMap[gift.bookId].totalGifts++
      if (!bookGiftMap[gift.bookId].giftCounts[gift.giftType]) {
        bookGiftMap[gift.bookId].giftCounts[gift.giftType] = 0
      }
      bookGiftMap[gift.bookId].giftCounts[gift.giftType]++
    })

    return Object.values(bookGiftMap)
      .sort((a, b) => b.totalGifts - a.totalGifts)
      .slice(0, limit)
  }

  loadFromStorage()

  watch(gifts, () => {
    saveToStorage()
  }, { deep: true })

  return {
    gifts,
    giftTypes,
    sendGift,
    getBookGifts,
    getChapterGifts,
    getBookGiftCounts,
    getTopBooksByGifts
  }
})
