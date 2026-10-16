<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppFooter from '@/components/AppFooter.vue'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')

async function handleSubmit() {
  const success = await auth.login(username.value, password.value)
  if (success) {
    router.push({ name: 'main' })
  }
}
</script>

<template>
  <div class="login-screen">
    <header>
      <h1>Berlin Infra Watch</h1>
    </header>

    <main>
      <form @submit.prevent="handleSubmit">
        <label>
          Username
          <input v-model="username" type="text" required autocomplete="username" />
        </label>

        <label>
          Password
          <input v-model="password" type="password" required autocomplete="current-password" />
        </label>

        <p v-if="auth.error" class="error-text">{{ auth.error }}</p>

        <button type="submit" class="btn btn-primary" :disabled="auth.loading">
          {{ auth.loading ? 'Logging in...' : 'Log in' }}
        </button>
      </form>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.login-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  padding: 1.5rem 1rem 0;
  text-align: center;
}

header h1 {
  font-size: 1.75rem;
}

main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  width: min(360px, 100%);
  background: var(--color-surface);
  padding: 2rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

button {
  margin-top: 0.4rem;
}

@media (max-width: 480px) {
  form {
    padding: 1.5rem;
  }
}
</style>
