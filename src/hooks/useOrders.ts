import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import { Order } from '../types/order'

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => api.get('/api/orders').then(res => {
      const d = res.data
      return (Array.isArray(d) ? d : (d.data ?? [])) as Order[]
    }),
  })
}
