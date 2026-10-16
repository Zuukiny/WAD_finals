<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Location } from '@/types'

const props = defineProps<{
  locations: Location[]
  hoveredId: string | null
}>()

const emit = defineEmits<{
  markerClick: [id: string]
  markerHover: [id: string | null]
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
const markers = new Map<string, L.Marker>()

// Tracks the id (if any) that THIS component last emitted via markerHover,
// so the pan logic below can tell "list hovered this marker" (pan to it)
// apart from "this marker itself is being hovered" (don't pan - the cursor
// is already on it, and panning would drag it out from under the mouse).
let lastEmittedHoverId: string | null = null

// Custom teardrop pin as inline SVG via divIcon - gives us full CSS control
// (color, drop shadow, hover scale animation) instead of Leaflet's default
// blue image marker. Colors match the app's design tokens (see tokens.css).
function createPinIcon(highlighted: boolean): L.DivIcon {
  const fill = highlighted ? '#1c1f22' : '#4c8b5b'
  const inner = highlighted ? '#4c8b5b' : '#1c1f22'

  const svg = `
    <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 27 15 27s15-15.75 15-27C30 6.7 23.3 0 15 0z" fill="${fill}"/>
      <circle cx="15" cy="15" r="5.5" fill="${inner}"/>
    </svg>
  `

  return L.divIcon({
    html: svg,
    className: `location-pin${highlighted ? ' location-pin-highlighted' : ''}`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -36],
  })
}

function syncMarkers() {
  if (!map) return

  const currentIds = new Set(props.locations.map((loc) => loc._id))

  for (const [id, marker] of markers) {
    if (!currentIds.has(id)) {
      marker.remove()
      markers.delete(id)
    }
  }

  for (const location of props.locations) {
    const existing = markers.get(location._id)

    if (existing) {
      existing.setLatLng([location.lat, location.lng])
    } else {
      const marker = L.marker([location.lat, location.lng], { icon: createPinIcon(false) })
        .addTo(map)
        .bindPopup(location.name)
        .on('click', () => emit('markerClick', location._id))
        .on('mouseover', () => {
          lastEmittedHoverId = location._id
          emit('markerHover', location._id)
        })
        .on('mouseout', () => {
          lastEmittedHoverId = null
          emit('markerHover', null)
        })
      markers.set(location._id, marker)
    }
  }
}

function syncHighlight() {
  for (const [id, marker] of markers) {
    marker.setIcon(createPinIcon(id === props.hoveredId))
  }

  // Pan to the hovered marker if it's off-screen - but only when the hover
  // came from the list (lastEmittedHoverId won't match in that case, since
  // this component didn't emit it). If the marker itself was hovered, it's
  // already visible under the cursor, and panning would drag it away.
  if (map && props.hoveredId && props.hoveredId !== lastEmittedHoverId) {
    const marker = markers.get(props.hoveredId)
    if (marker) {
      const latlng = marker.getLatLng()
      // Shrink the bounds by 20% on each side so "visible" means comfortably
      // visible, not just technically inside the viewport's exact edge.
      const visibleBounds = map.getBounds().pad(-0.2)
      if (!visibleBounds.contains(latlng)) {
        map.panTo(latlng, { animate: true })
      }
    }
  }
}

function handleResize() {
  map?.invalidateSize()
}

onMounted(() => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value).setView([52.520008, 13.404954], 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  syncMarkers()

  requestAnimationFrame(() => map?.invalidateSize())
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  map?.remove()
  map = null
})

watch(() => props.locations, syncMarkers, { deep: true })
watch(() => props.hoveredId, syncHighlight)
</script>

<template>
  <div ref="mapContainer" class="map"></div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>

<style>
/* Global (unscoped) because Leaflet renders marker DOM outside this component */
.location-pin {
  cursor: pointer;
  transition: transform 0.15s ease;
  transform-origin: 50% 100%; /* scale grows from the pin's tip, not its center */
}

.location-pin svg {
  display: block;
  filter: drop-shadow(0 2px 3px rgba(28, 31, 34, 0.35));
}

.location-pin-highlighted {
  transform: scale(1.2);
}
</style>