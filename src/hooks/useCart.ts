import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'
import api from '../lib/axios'
import { Cart, CartItem, CartPayloadItem } from '../types/cart'
import useAuthStore from '../store/authStore'

export function useCart() {
  const token = useAuthStore((s) => s.token)

  return useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/api/carts')
      return res.data
    },
    enabled: !!token,
  })
}

export function useUpdateCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['cart'],
    mutationFn: (items: CartPayloadItem[]) =>
      api.put('/api/carts', { items }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },

    onError: () => {
      Alert.alert('Gagal', 'Gagal update cart, coba lagi')
    },
  })
}

export function useCartQty(productId: string): number {
  const queryClient = useQueryClient()
  const cart = queryClient.getQueryData<Cart>(['cart'])
  return (cart ?? []).find(i => i._id === productId)?.qty ?? 0
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  const updateCart = useUpdateCart()

  const addToCart = (productId: string, qty = 1) => {
    const cart = queryClient.getQueryData<Cart>(['cart'])
    const currentItems: CartPayloadItem[] = (cart ?? []).map((item: CartItem) => ({
      _id: item._id,
      qty: item.qty,
    }))

    const existing = currentItems.find(i => i._id === productId)

    const newItems = existing
      ? currentItems.map(i => i._id === productId ? { ...i, qty: i.qty + qty } : i)
      : [...currentItems, { _id: productId, qty }]

    updateCart.mutate(newItems)
  }

  return { addToCart, isPending: updateCart.isPending }
}
