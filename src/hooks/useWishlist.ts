import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import { WishlistItem } from '../types/wishlist'

export function useWishlist() {
  return useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: () => api.get('/api/wishlists').then(res =>
      ((res.data?.data ?? []) as WishlistItem[]).filter(w => w.product !== null)
    ),
  })
}

export function useAddWishlist() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (product_id) =>
      api.post('/api/wishlists', { product_id }).then(res => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}

export function useRemoveWishlist() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (product_id) =>
      api.delete(`/api/wishlists/${product_id}`).then(res => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}
