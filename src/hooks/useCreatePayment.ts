import { useMutation } from '@tanstack/react-query'
import api from '../lib/axios'

interface PaymentTokenResponse {
  snap_token: string
}

export function useGetPaymentToken() {
  return useMutation<PaymentTokenResponse, Error, string>({
    mutationFn: (order_id) =>
      api.get(`/api/payments/token/${order_id}`, { timeout: 30000 }).then(res => res.data),
  })
}
