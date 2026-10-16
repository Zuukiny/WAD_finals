import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types'
import * as api from '@/services/api'

const STORAGE_KEY = 'auth-user'

export const useAuthStore = defineStore('auth', () => {
  // Restore session on page refresh so the user isn't kicked back to login
  const stored = sessionStorage.getItem(STORAGE_KEY)
  const user = ref<User | null>(stored ? JSON.parse(stored) : null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(username: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const loggedInUser = await api.login(username, password)
      user.value = loggedInUser
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser))
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return { user, error, loading, isLoggedIn, isAdmin, login, logout }
})
