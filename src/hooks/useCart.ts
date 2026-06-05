import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
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
  const navigation = useNavigation<any>()

  return useMutation({
    mutationKey: ['cart'],
    mutationFn: (items: CartPayloadItem[]) =>
      api.put('/api/carts', { items }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },

    onError: (error: any) => {
      const message = error?.response?.data?.message ?? ''
      if (message.includes('not allowed') || error?.response?.status === 401) {
        navigation.navigate('Login')
      } else {
        Alert.alert('Gagal', 'Gagal update cart, coba lagi')
      }
    },
  })
}

export function useCartQty(productId: string): number {
  const queryClient = useQueryClient()
  const cart = queryClient.getQueryData<Cart>(['cart'])
  return (cart ?? []).find(i => i._id === productId)?.qty ?? 0
}

interface AddToCartProduct {
  _id: string
  name: string
  price: number
  image_url: string
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  const updateCart = useUpdateCart()

  const addToCart = (product: AddToCartProduct, qty = 1) => {
    const cart = queryClient.getQueryData<Cart>(['cart'])
    const currentItems: CartPayloadItem[] = (cart ?? []).map((item: CartItem) => ({
      _id: item._id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      qty: item.qty,
      checked: item.checked ?? true,
    }))

    const existing = currentItems.find(i => i._id === product._id)

    const newItems: CartPayloadItem[] = existing
      ? currentItems.map(i => i._id === product._id ? { ...i, qty: i.qty + qty } : i)
      : [...currentItems, { _id: product._id, name: product.name, price: product.price, image_url: product.image_url, qty, checked: true }]

    updateCart.mutate(newItems)
  }

  return { addToCart, isPending: updateCart.isPending }
}
