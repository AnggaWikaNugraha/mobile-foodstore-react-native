import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import { Order } from '../types/order'

export function useOrder(orderId: string) {
  return useQuery<Order>({
    queryKey: ['orders', orderId],
    queryFn: () => api.get(`/api/orders/${orderId}`).then(res => res.data),
    enabled: !!orderId,
  })
}
