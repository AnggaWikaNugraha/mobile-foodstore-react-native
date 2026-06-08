import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import { Product } from '../types/product'

export function useProduct(productId: string, name: string) {
  return useQuery<Product | undefined>({
    queryKey: ['products', productId],
    queryFn: () =>
      api.get('/api/products', { params: { q: name, limit: 20 } }).then(res =>
        ((res.data?.data ?? []) as Product[]).find(p => p._id === productId)
      ),
    enabled: !!productId && !!name,
  })
}
