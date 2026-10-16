export interface User {
  username: string
  name: string
  role: 'admin' | 'user'
}

export interface Location {
  _id: string
  name: string
  description: string
  street: string
  zip: string
  city: string
  category: string
  lat: number
  lng: number
  imageUrl: string | null
}

// Shape used when creating/editing a location (no _id / imageUrl yet)
export type LocationInput = Omit<Location, '_id' | 'imageUrl'>
