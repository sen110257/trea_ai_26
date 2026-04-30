import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'reading_settings'

const defaultSettings = {
  fontSize: 18,
  lineHeight: 1.8,
  pageMargin: 40,
  theme: 'day',
  scrollMode: 'scroll'
}

const themes = {
  day: {
    bg: '#fafaf9',
    text: '#374151',
    border: '#e5e7eb',
    cardBg: '#ffffff'
  },
  green: {
    bg: '#e8f5e9',
    text: '#2c5f2d',
    border: '#a5d6a7',
    cardBg: '#f1f8e9'
  },
  night: {
    bg: '#1a1a2e',
    text: '#e5e7eb',
    border: '#2d2d44',
    cardBg: '#16213e'
  },
  paper: {
    bg: '#f5f1e8',
    text: '#5c4033',
    border: '#d7ccc8',
    cardBg: '#faf7f0'
  }
}

export const useReadingSettingsStore = defineStore('readingSettings', () => {
  const settings = ref({ ...defaultSettings })

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        settings.value = { ...defaultSettings, ...parsed }
      }
    } catch (e) {
      console.error('Failed to load reading settings:', e)
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value))
    } catch (e) {
      console.error('Failed to save reading settings:', e)
    }
  }

  function setFontSize(size) {
    settings.value.fontSize = Math.max(14, Math.min(32, size))
  }

  function setLineHeight(height) {
    settings.value.lineHeight = Math.max(1.4, Math.min(2.5, height))
  }

  function setPageMargin(margin) {
    settings.value.pageMargin = Math.max(16, Math.min(80, margin))
  }

  function setTheme(theme) {
    if (themes[theme]) {
      settings.value.theme = theme
    }
  }

  function setScrollMode(mode) {
    settings.value.scrollMode = mode
  }

  function reset() {
    settings.value = { ...defaultSettings }
  }

  function getThemeColors() {
    return themes[settings.value.theme] || themes.day
  }

  loadFromStorage()

  watch(settings, () => {
    saveToStorage()
  }, { deep: true })

  return {
    settings,
    themes,
    setFontSize,
    setLineHeight,
    setPageMargin,
    setTheme,
    setScrollMode,
    reset,
    getThemeColors
  }
})
