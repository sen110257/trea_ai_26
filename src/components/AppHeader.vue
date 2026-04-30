<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const navLinks = [
  { path: '/', name: '首页', icon: '🏠' },
  { path: '/rank', name: '排行榜', icon: '🏆' },
  { path: '/bookshelf', name: '书架', icon: '📚' },
  { path: '/history', name: '历史', icon: '⏰' }
]

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

function goHome() {
  router.push('/')
  isMobileMenuOpen.value = false
}

function navigateTo(path) {
  router.push(path)
  isMobileMenuOpen.value = false
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-soft' : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 sm:h-20">
        <div 
          class="flex items-center gap-3 cursor-pointer group"
          @click="goHome"
        >
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <span class="text-white text-lg">📖</span>
          </div>
          <div class="hidden sm:block">
            <h1 class="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              悦读书屋
            </h1>
            <p class="text-xs text-gray-500 -mt-1">静心阅读，品味生活</p>
          </div>
        </div>

        <nav class="hidden md:flex items-center gap-1">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            :class="route.path === link.path 
              ? 'bg-purple-50 text-purple-700' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            <span class="mr-1.5">{{ link.icon }}</span>
            {{ link.name }}
          </router-link>
        </nav>

        <button
          class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          @click="toggleMobileMenu"
          aria-label="菜单"
        >
          <svg v-if="!isMobileMenuOpen" class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isMobileMenuOpen" class="md:hidden bg-white border-t border-gray-100 shadow-lg">
        <div class="px-4 py-3 space-y-1">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            @click="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors"
            :class="route.path === link.path 
              ? 'bg-purple-50 text-purple-700' 
              : 'text-gray-600 hover:bg-gray-50'"
          >
            <span class="text-lg">{{ link.icon }}</span>
            {{ link.name }}
          </router-link>
        </div>
      </div>
    </Transition>
  </header>
</template>
