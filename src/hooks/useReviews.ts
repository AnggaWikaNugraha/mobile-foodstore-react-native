import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import { Review, CreateReviewPayload } from '../types/review'

export function useReviews(params: { product_id?: string; order_id?: string }) {
  return useQuery<Review[]>({
    queryKey: ['reviews', params],
    queryFn: () =>
      api.get('/api/reviews', { params }).then(res => (res.data?.data ?? res.data ?? []) as Review[]),
    enabled: !!(params.product_id || params.order_id),
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, CreateReviewPayload>({
    mutationFn: (payload) =>
      api.post('/api/reviews', payload)
        .then(res => res.data)
        .catch(err => {
          const msg = err?.response?.data?.message ?? err?.message ?? 'Gagal mengirim ulasan'
          throw new Error(msg)
        }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', { order_id: vars.order_id }] })
      queryClient.invalidateQueries({ queryKey: ['reviews', { product_id: vars.product_id }] })
    },
  })
}
