import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import { Order } from '../types/order'

interface OrdersPage {
  data: Order[]
  count: number
}

export const ORDERS_PAGE_SIZE = 5

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => api.get('/api/orders').then(res => {
      const d = res.data
      return (Array.isArray(d) ? d : (d.data ?? [])) as Order[]
    }),
  })
}

export function useInfiniteOrders(params: { status?: string } = {}) {
  return useInfiniteQuery<OrdersPage>({
    queryKey: ['orders', 'infinite', params],
    queryFn: ({ pageParam }) =>
      api.get('/api/orders', {
        params: { ...params, limit: ORDERS_PAGE_SIZE, skip: pageParam },
      }).then(res => {
        const d = res.data
        return {
          data: (Array.isArray(d) ? d : (d.data ?? [])) as Order[],
          count: d.count ?? (Array.isArray(d) ? d.length : 0),
        }
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.reduce((sum, p) => sum + p.data.length, 0)
      return fetched < lastPage.count ? fetched : undefined
    },
  })
}
