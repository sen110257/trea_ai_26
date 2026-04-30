import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'annotations'

export const useAnnotationsStore = defineStore('annotations', () => {
  const annotations = ref([])

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        annotations.value = JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load annotations:', e)
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations.value))
    } catch (e) {
      console.error('Failed to save annotations:', e)
    }
  }

  function addAnnotation(bookId, chapterId, text, startIndex, endIndex, note = '') {
    const annotation = {
      id: `${bookId}-${chapterId}-${Date.now()}`,
      bookId: bookId,
      chapterId: chapterId,
      text: text,
      startIndex: startIndex,
      endIndex: endIndex,
      note: note,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    annotations.value.push(annotation)
    return annotation
  }

  function getChapterAnnotations(bookId, chapterId) {
    return annotations.value.filter(
      ann => ann.bookId === bookId && ann.chapterId === chapterId
    ).sort((a, b) => a.startIndex - b.startIndex)
  }

  function getBookAnnotations(bookId) {
    return annotations.value.filter(ann => ann.bookId === bookId)
  }

  function updateAnnotation(annotationId, note) {
    const annotation = annotations.value.find(ann => ann.id === annotationId)
    if (annotation) {
      annotation.note = note
      annotation.updatedAt = Date.now()
    }
  }

  function deleteAnnotation(annotationId) {
    const index = annotations.value.findIndex(ann => ann.id === annotationId)
    if (index > -1) {
      annotations.value.splice(index, 1)
      return true
    }
    return false
  }

  function deleteChapterAnnotations(bookId, chapterId) {
    annotations.value = annotations.value.filter(
      ann => !(ann.bookId === bookId && ann.chapterId === chapterId)
    )
  }

  function deleteBookAnnotations(bookId) {
    annotations.value = annotations.value.filter(ann => ann.bookId !== bookId)
  }

  loadFromStorage()

  watch(annotations, () => {
    saveToStorage()
  }, { deep: true })

  return {
    annotations,
    addAnnotation,
    getChapterAnnotations,
    getBookAnnotations,
    updateAnnotation,
    deleteAnnotation,
    deleteChapterAnnotations,
    deleteBookAnnotations
  }
})
