import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import { ProductsResponse } from '../types/product'

interface ProductsParams {
  q?: string
  category?: string
  tags?: string[]
  limit?: number
  skip?: number
}

type FilterParams = Omit<ProductsParams, 'limit' | 'skip'>

export const PRODUCTS_PAGE_SIZE = 5

export function useProducts(params: ProductsParams = {}) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await api.get('/api/products', { params })
      return res.data
    },
  })
}

export function useInfiniteProducts(params: FilterParams = {}) {
  return useInfiniteQuery<ProductsResponse>({
    queryKey: ['products', 'infinite', params],
    queryFn: ({ pageParam }) =>
      api.get('/api/products', {
        params: { ...params, limit: PRODUCTS_PAGE_SIZE, skip: pageParam },
      }).then(res => res.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const fetched = allPages.reduce((sum, p) => sum + p.data.length, 0)
      return fetched < lastPage.count ? fetched : undefined
    },
  })
}
