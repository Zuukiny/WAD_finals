<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocationsStore } from '@/stores/locations'
import * as api from '@/services/api'
import AppFooter from '@/components/AppFooter.vue'

const locations = useLocationsStore()
const router = useRouter()

const name = ref('')
const description = ref('')
const street = ref('')
const zip = ref('')
const city = ref('')
const category = ref('')
const photo = ref<File | null>(null)
const errorMessage = ref<string | null>(null)
const submitting = ref(false)

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  photo.value = target.files?.[0] ?? null
}

async function handleSubmit() {
  errorMessage.value = null
  submitting.value = true

  try {
    const coords = await api.geocodeAddress(street.value, zip.value, city.value)

    if (!coords) {
      errorMessage.value = 'Could not find that address. Please check it and try again.'
      return
    }

    const created = await locations.add({
      name: name.value,
      description: description.value,
      street: street.value,
      zip: zip.value,
      city: city.value,
      category: category.value,
      lat: coords.lat,
      lng: coords.lng,
    })

    if (photo.value) {
      await locations.uploadImage(created._id, photo.value)
    }

    router.push({ name: 'main' })
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Something went wrong.'
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  router.push({ name: 'main' })
}
</script>

<template>
  <div class="add-location-screen">
    <header>
      <h1>Add location</h1>
    </header>

    <form @submit.prevent="handleSubmit">
      <label>
        Title
        <input v-model="name" type="text" required />
      </label>

      <label>
        Description
        <textarea v-model="description" rows="3"></textarea>
      </label>

      <div class="row">
        <label class="grow">
          Street
          <input v-model="street" type="text" required />
        </label>
        <label class="short">
          Zip code
          <input v-model="zip" type="text" required />
        </label>
      </div>

      <label>
        City
        <input v-model="city" type="text" required />
      </label>

      <label>
        Category
        <input v-model="category" type="text" required placeholder="e.g. bike lane, green space" />
      </label>

      <label>
        Photo (optional)
        <input type="file" accept="image/*" @change="handleFileChange" />
      </label>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <div class="actions">
        <button type="button" class="btn btn-secondary" @click="handleCancel">Cancel</button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </form>

    <AppFooter />
  </div>
</template>

<style scoped>
.add-location-screen {
  max-width: 560px;
  margin: 0 auto;
  padding: 1.5rem;
}

header {
  margin-bottom: 1.25rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  background: var(--color-surface);
  padding: 1.5rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.row {
  display: flex;
  gap: 1rem;
}

.row .grow {
  flex: 2;
  min-width: 0;
}

.row .short {
  flex: 1;
  min-width: 0;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

@media (max-width: 480px) {
  .add-location-screen {
    padding: 1rem;
  }

  form {
    padding: 1.25rem;
  }

  .row {
    flex-direction: column;
  }

  .actions {
    flex-direction: column-reverse;
  }

  .actions .btn {
    width: 100%;
  }
}
</style>
