import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import BookDetailView from '@/views/BookDetailView.vue'
import ReaderView from '@/views/ReaderView.vue'
import AuthorView from '@/views/AuthorView.vue'
import RankView from '@/views/RankView.vue'
import BookshelfView from '@/views/BookshelfView.vue'
import HistoryView from '@/views/HistoryView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: '首页' }
  },
  {
    path: '/book/:id',
    name: 'book-detail',
    component: BookDetailView,
    meta: { title: '小说详情' }
  },
  {
    path: '/read/:bookId/:chapterId',
    name: 'reader',
    component: ReaderView,
    meta: { title: '阅读' }
  },
  {
    path: '/author/:id',
    name: 'author',
    component: AuthorView,
    meta: { title: '作者' }
  },
  {
    path: '/rank',
    name: 'rank',
    component: RankView,
    meta: { title: '排行榜' }
  },
  {
    path: '/bookshelf',
    name: 'bookshelf',
    component: BookshelfView,
    meta: { title: '书架' }
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryView,
    meta: { title: '阅读历史' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || '小说阅读'} - 悦读书屋`
})

export default router
