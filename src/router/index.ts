import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      // public: reachable without being logged in
      // guestOnly: logged-in users get redirected away from it (only applies to login)
      meta: { public: true, guestOnly: true },
    },
    {
      path: '/',
      name: 'main',
      component: () => import('@/views/MainView.vue'),
    },
    {
      path: '/add',
      name: 'add-location',
      component: () => import('@/views/AddLocationView.vue'),
      meta: { adminOnly: true },
    },
    {
      path: '/location/:id',
      name: 'location-detail',
      component: () => import('@/views/LocationDetailView.vue'),
      props: true,
    },
    {
      path: '/impressum',
      name: 'impressum',
      component: () => import('@/views/ImpressumView.vue'),
      meta: { public: true },
    },
    {
      path: '/datenschutz',
      name: 'datenschutz',
      component: () => import('@/views/DatenschutzView.vue'),
      meta: { public: true },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Not logged in -> only public pages (login, impressum, datenschutz) are reachable
  if (!to.meta.public && !auth.isLoggedIn) {
    return { name: 'login' }
  }

  // Already logged in -> don't show the login screen again
  // (Impressum/Datenschutz stay reachable either way, so they're NOT guestOnly)
  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: 'main' }
  }

  // Regular users can't reach the add-location screen
  if (to.meta.adminOnly && !auth.isAdmin) {
    return { name: 'main' }
  }

  return true
})

export default router
