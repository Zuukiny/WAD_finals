<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLocationsStore } from '@/stores/locations'
import LocationMap from '@/components/LocationMap.vue'
import AppFooter from '@/components/AppFooter.vue'
import type { Location } from '@/types'

const auth = useAuthStore()
const locations = useLocationsStore()
const router = useRouter()

type SortField = 'name' | 'category' | 'street' | 'zip'
const sortBy = ref<SortField>('name')

const sortedLocations = computed(() => {
  const field = sortBy.value
  return [...locations.locations].sort((a: Location, b: Location) =>
    a[field].localeCompare(b[field], undefined, { sensitivity: 'base' }),
  )
})

onMounted(() => {
  // Stale hover state from a previous visit (e.g. clicked a marker/list item
  // to navigate away, which fires before mouseleave can clean up) shouldn't
  // carry over - start fresh every time this screen is entered.
  locations.hoveredId = null
  locations.fetchAll()
})

function goToDetail(id: string) {
  router.push({ name: 'location-detail', params: { id } })
}

// When a marker is hovered on the map, scroll its list entry into view.
// "nearest" means this does nothing if the item is already visible - so
// hovering a list item directly (which triggered this too) doesn't cause
// any distracting scroll-jump of its own.
watch(
  () => locations.hoveredId,
  (id) => {
    if (!id) return
    nextTick(() => {
      const el = document.querySelector(`.list-scroll li[data-id="${id}"]`)
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
  },
)

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="main-screen">
    <header>
      <h1>Welcome back, {{ auth.user?.name }}!</h1>
      <button class="btn btn-secondary" @click="handleLogout">Log out</button>
    </header>

    <div class="content">
      <div class="map-wrapper">
        <LocationMap
          :locations="locations.locations"
          :hovered-id="locations.hoveredId"
          @marker-click="goToDetail"
          @marker-hover="(id) => (locations.hoveredId = id)"
        />
      </div>

      <div class="list">
        <div class="list-toolbar">
          <RouterLink v-if="auth.isAdmin" :to="{ name: 'add-location' }" class="btn btn-primary add-button">
            + Add location
          </RouterLink>

          <label class="sort-control">
            Sort by
            <select v-model="sortBy">
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="street">Street</option>
              <option value="zip">Zip code</option>
            </select>
          </label>
        </div>

        <p v-if="locations.loading && locations.locations.length === 0" class="status-text">
          Loading...
        </p>
        <p v-if="locations.error" class="error-text">{{ locations.error }}</p>
        <p v-if="!locations.loading && locations.locations.length === 0" class="status-text">
          No locations reported yet.
        </p>

        <div class="list-scroll">
          <ul>
            <li
              v-for="location in sortedLocations"
              :key="location._id"
              :data-id="location._id"
              :class="{ highlighted: locations.hoveredId === location._id }"
              @click="goToDetail(location._id)"
              @mouseenter="locations.hoveredId = location._id"
              @mouseleave="locations.hoveredId = null"
            >
              <img v-if="location.imageUrl" :src="location.imageUrl" :alt="location.name" />
              <div v-else class="img-placeholder"></div>
              <div class="info">
                <strong>{{ location.name }}</strong>
                <span class="address">{{ location.street }}, {{ location.zip }}</span>
                <span class="badge">{{ location.category }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<style scoped>
.main-screen {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-line);
  flex-shrink: 0;
}

header h1 {
  font-size: 1.3rem;
}

.content {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  flex: 1;
  min-height: 0;
}

.map-wrapper {
  flex: 2;
  min-height: 0;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.list {
  flex: 1;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  /* Own height comes from flex stretch against .map-wrapper's height */
  min-height: 0;
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.add-button {
  text-decoration: none;
  text-align: center;
}

.sort-control {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-slate);
}

.sort-control select {
  padding: 0.35rem 0.5rem;
  font-size: 0.85rem;
}

.status-text {
  color: var(--color-slate);
}

/* Scroll container - takes whatever vertical space is left after the
   toolbar/status text, and scrolls internally instead of growing the page. */
.list-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

li {
  display: flex;
  gap: 0.75rem;
  padding: 0.6rem;
  cursor: pointer;
  background: var(--color-surface);
  border-radius: var(--radius);
  border: 1px solid var(--color-line);
  transition: border-color 0.15s ease;
}

li:hover,
li.highlighted {
  border-color: var(--color-amber);
  background: rgba(76, 139, 91, 0.08);
}

li img,
.img-placeholder {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.img-placeholder {
  background: var(--color-line);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.info strong {
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.address {
  font-size: 0.8rem;
  color: var(--color-slate);
}

.badge {
  align-self: flex-start;
}

/* Stack map above list on tablets/phones instead of side-by-side */
@media (max-width: 768px) {
  .main-screen {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .content {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    height: auto;
    min-height: 0;
  }

  .map-wrapper {
    flex: none;
    height: 45vh;
  }

  .list {
    flex: none;
    max-height: 50vh;
  }

  header {
    padding: 1rem;
  }

  header h1 {
    font-size: 1.1rem;
  }
}
</style>