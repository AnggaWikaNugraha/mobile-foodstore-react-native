import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import { Order } from '../types/order'

interface CreateOrderPayload {
  delivery_fee: number
  delivery_address: string
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation<Order, Error, CreateOrderPayload>({
    mutationFn: (payload) =>
      api.post('/api/orders', payload).then(res => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
