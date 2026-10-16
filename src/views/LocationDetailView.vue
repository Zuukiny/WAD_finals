<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocationsStore } from '@/stores/locations'
import * as api from '@/services/api'
import type { Location } from '@/types'
import AppFooter from '@/components/AppFooter.vue'

const props = defineProps<{ id: string }>()

const auth = useAuthStore()
const locations = useLocationsStore()
const router = useRouter()

const location = ref<Location | null>(null)
const errorMessage = ref<string | null>(null)
const newPhoto = ref<File | null>(null)
const newPhotoPreviewUrl = ref<string | null>(null)
const removingPhoto = ref(false)

// Shows the freshly-picked file immediately (before it's uploaded), falling
// back to the location's current photo. Gives instant visual feedback
// instead of waiting for the full save round-trip.
const displayedPhotoUrl = computed(() => newPhotoPreviewUrl.value ?? location.value?.imageUrl ?? null)

onMounted(async () => {
  const existing = locations.locations.find((loc) => loc._id === props.id)
  location.value = existing ?? (await api.getLocation(props.id))
})

onBeforeUnmount(() => {
  if (newPhotoPreviewUrl.value) URL.revokeObjectURL(newPhotoPreviewUrl.value)
})

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null

  if (newPhotoPreviewUrl.value) URL.revokeObjectURL(newPhotoPreviewUrl.value)

  newPhoto.value = file
  newPhotoPreviewUrl.value = file ? URL.createObjectURL(file) : null
}

// Independent, immediate action - doesn't wait for the Update button.
// The store mutates location.imageUrl directly on the same reactive object,
// so the photo disappears from screen the instant the request resolves.
async function handleRemovePhoto() {
  if (!location.value) return
  removingPhoto.value = true
  errorMessage.value = null

  try {
    await locations.deleteImage(location.value._id)
    // Also clear any pending unsaved file selection/preview
    if (newPhotoPreviewUrl.value) URL.revokeObjectURL(newPhotoPreviewUrl.value)
    newPhoto.value = null
    newPhotoPreviewUrl.value = null
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Could not remove photo.'
  } finally {
    removingPhoto.value = false
  }
}

async function handleUpdate() {
  if (!location.value) return
  errorMessage.value = null

  try {
    const coords = await api.geocodeAddress(location.value.street, location.value.zip, location.value.city)
    if (!coords) {
      errorMessage.value = 'Could not find that address.'
      return
    }

    await locations.update(location.value._id, {
      name: location.value.name,
      description: location.value.description,
      street: location.value.street,
      zip: location.value.zip,
      city: location.value.city,
      category: location.value.category,
      lat: coords.lat,
      lng: coords.lng,
    })

    if (newPhoto.value) {
      await locations.uploadImage(location.value._id, newPhoto.value)
    }

    router.push({ name: 'main' })
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Update failed.'
  }
}

async function handleDelete() {
  if (!location.value) return
  await locations.remove(location.value._id)
  router.push({ name: 'main' })
}

function handleClose() {
  router.push({ name: 'main' })
}
</script>

<template>
  <div v-if="location" class="detail-screen">
    <header>
      <h1>{{ location.name }}</h1>
      <span class="badge">{{ location.category }}</span>
    </header>

    <img v-if="displayedPhotoUrl" :src="displayedPhotoUrl" :alt="location.name" class="photo" />

    <template v-if="auth.isAdmin">
      <form @submit.prevent="handleUpdate">
        <label>
          Title
          <input v-model="location.name" type="text" required />
        </label>
        <label>
          Description
          <textarea v-model="location.description" rows="3"></textarea>
        </label>

        <div class="row">
          <label class="grow">
            Street
            <input v-model="location.street" type="text" required />
          </label>
          <label class="short">
            Zip code
            <input v-model="location.zip" type="text" required />
          </label>
        </div>

        <label>
          City
          <input v-model="location.city" type="text" required />
        </label>
        <label>
          Category
          <input v-model="location.category" type="text" required />
        </label>

        <label>
          Replace photo
          <input type="file" accept="image/*" @change="handleFileChange" />
        </label>

        <button
          v-if="displayedPhotoUrl"
          type="button"
          class="btn btn-secondary remove-photo-btn"
          :disabled="removingPhoto"
          @click="handleRemovePhoto"
        >
          {{ removingPhoto ? 'Removing...' : 'Remove photo' }}
        </button>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <div class="actions">
          <button type="button" class="btn btn-danger" @click="handleDelete">Delete</button>
          <button type="button" class="btn btn-secondary" @click="handleClose">Cancel</button>
          <button type="submit" class="btn btn-primary">Update</button>
        </div>
      </form>
    </template>

    <template v-else>
      <p class="description">{{ location.description }}</p>
      <p class="address">{{ location.street }}, {{ location.zip }} {{ location.city }}</p>
      <button class="btn btn-secondary" @click="handleClose">Close</button>
    </template>

    <AppFooter />
  </div>

  <p v-else class="status-text">Loading...</p>
</template>

<style scoped>
.detail-screen {
  max-width: 560px;
  margin: 0 auto;
  padding: 1.5rem;
}

header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

header h1 {
  font-size: 1.4rem;
}

.photo {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: var(--radius);
  margin-bottom: 1.25rem;
}

.description {
  color: var(--color-ink);
}

.address {
  color: var(--color-slate);
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

.remove-photo-btn {
  align-self: flex-start;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

@media (max-width: 480px) {
  .detail-screen {
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
