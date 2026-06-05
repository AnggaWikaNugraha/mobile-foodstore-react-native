import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

export function useVerifyPayment() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (order_id) =>
      api.get(`/api/payments/verify/${order_id}`).then(res => res.data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
