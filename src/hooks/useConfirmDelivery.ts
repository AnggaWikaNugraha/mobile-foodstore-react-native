import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

export function useConfirmDelivery() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (orderId) =>
      api.put(`/api/orders/${orderId}/status`, { status: 'delivered' }).then(res => res.data),

    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
    },
  })
}
