import { create } from 'zustand'
import { getItem, setItem, deleteItem } from '../lib/secureStorage'
import api from '../lib/axios'

interface User {
  _id: string
  full_name: string
  email: string
  role: 'user' | 'admin'
  email_verified?: boolean
  google_id?: string
  customer_no?: number
  image_url?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  setAuth: (user: User, token: string) => Promise<void>
  loadAuth: () => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: async (user, token) => {
    await setItem('token', token)
    set({ user, token })
  },

  loadAuth: async () => {
    const token = await getItem('token')
    if (!token) {
      set({ token: null, user: null, isLoading: false })
      return
    }
    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      set({ token, user: res.data, isLoading: false })
    } catch {
      // token expired atau invalid
      await deleteItem('token')
      set({ token: null, user: null, isLoading: false })
    }
  },

  logout: async () => {
    await deleteItem('token')
    set({ user: null, token: null })
  },

  updateUser: (updates) =>
    set(s => ({ user: s.user ? { ...s.user, ...updates } : null })),
}))

export default useAuthStore
