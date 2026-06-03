import { create } from 'zustand'
import { getItem, setItem, deleteItem } from '../lib/secureStorage'

const useAuthStore = create((set) => ({
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
