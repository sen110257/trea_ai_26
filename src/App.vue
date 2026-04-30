<script setup>
import { RouterView } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <main class="pt-16 sm:pt-20 min-h-screen">
      <RouterView v-slot="{ Component, route }">
        <Transition
          name="page"
          mode="out-in"
          appear
        >
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>
    
    <footer class="bg-white border-t border-gray-100 py-8 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <div class="flex items-center justify-center gap-2 mb-3">
            <span class="text-2xl">📖</span>
            <span class="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              悦读书屋
            </span>
          </div>
          <p class="text-sm text-gray-500">
            静心阅读，品味生活 | 纯前端静态演示
          </p>
          <p class="text-xs text-gray-400 mt-2">
            Vue3 + Vite + Tailwind CSS + Pinia
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
