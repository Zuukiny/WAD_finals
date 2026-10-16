import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Location, LocationInput } from '@/types'
import * as api from '@/services/api'

export const useLocationsStore = defineStore('locations', () => {
  const locations = ref<Location[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Used later to highlight a marker on the map when hovering the list (main screen)
  const hoveredId = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      locations.value = await api.getLocations()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load locations'
    } finally {
      loading.value = false
    }
  }

  async function add(data: LocationInput) {
    const created = await api.createLocation(data)
    locations.value.push(created)
    return created
  }

  async function update(id: string, data: Partial<LocationInput>) {
    await api.updateLocation(id, data)
    const index = locations.value.findIndex((loc) => loc._id === id)
    if (index !== -1) {
      locations.value[index] = { ...locations.value[index], ...data }
    }
  }

  async function remove(id: string) {
    await api.deleteLocation(id)
    locations.value = locations.value.filter((loc) => loc._id !== id)
  }

  async function uploadImage(id: string, file: File) {
    const { imageUrl } = await api.uploadLocationImage(id, file)
    const location = locations.value.find((loc) => loc._id === id)
    if (location) location.imageUrl = imageUrl
    return imageUrl
  }

  async function deleteImage(id: string) {
    await api.deleteLocationImage(id)
    const location = locations.value.find((loc) => loc._id === id)
    if (location) location.imageUrl = null
  }

  return {
    locations,
    loading,
    error,
    hoveredId,
    fetchAll,
    add,
    update,
    remove,
    uploadImage,
    deleteImage,
  }
})
