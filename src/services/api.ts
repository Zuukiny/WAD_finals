import type { User, Location, LocationInput } from '@/types'

const BASE_URL = ''

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // response had no JSON body - keep the generic message
    }
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export async function login(username: string, password: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return handleResponse<User>(res)
}

export async function getLocations(): Promise<Location[]> {
  const res = await fetch(`${BASE_URL}/loc`)
  return handleResponse<Location[]>(res)
}

export async function getLocation(id: string): Promise<Location> {
  const res = await fetch(`${BASE_URL}/loc/${id}`)
  return handleResponse<Location>(res)
}

export async function createLocation(data: LocationInput): Promise<Location> {
  const res = await fetch(`${BASE_URL}/loc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<Location>(res)
}

export async function updateLocation(id: string, data: Partial<LocationInput>): Promise<void> {
  const res = await fetch(`${BASE_URL}/loc/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return handleResponse<void>(res)
}

export async function deleteLocation(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/loc/${id}`, { method: 'DELETE' })
  return handleResponse<void>(res)
}

export async function uploadLocationImage(id: string, file: File): Promise<{ imageUrl: string }> {
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(`${BASE_URL}/loc/${id}/image`, {
    method: 'POST',
    body: formData,
  })
  return handleResponse<{ imageUrl: string }>(res)
}

export async function deleteLocationImage(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/loc/${id}/image`, { method: 'DELETE' })
  return handleResponse<void>(res)
}

export async function geocodeAddress(
  street: string,
  zip: string,
  city: string,
): Promise<{ lat: number; lng: number } | null> {
  const query = encodeURIComponent(`${street}, ${zip} ${city}, Germany`)
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
  if (!res.ok) throw new Error('Geocoding request failed')

  const results = await res.json()
  if (!results.length) return null

  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
}
