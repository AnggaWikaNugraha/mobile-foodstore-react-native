import { create } from 'zustand'
import { getItem, setItem, deleteItem } from '../lib/secureStorage'

interface User {
  _id: string
  full_name: string
  role: 'user' | 'admin'
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  setAuth: (user: User, token: string) => Promise<void>
  loadAuth: () => Promise<void>
  logout: () => Promise<void>
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
    set({ token, isLoading: false })
  },

  logout: async () => {
    await deleteItem('token')
    set({ user: null, token: null })
  },
}))

export default useAuthStore
