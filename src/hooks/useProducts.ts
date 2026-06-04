import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import { ProductsResponse } from '../types/product'

interface ProductsParams {
  q?: string
  category?: string
  tags?: string[]
  limit?: number
  skip?: number
}

export function useProducts(params: ProductsParams = {}) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await api.get('/api/products', { params })
      return res.data
    },
  })
}
