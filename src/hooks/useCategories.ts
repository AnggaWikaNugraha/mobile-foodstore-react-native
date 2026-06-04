import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import { Category } from '../types/product'

export function useCategories() {
  return useQuery<{ data: Category[]; count: number }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/api/categories')
      return res.data
    },
  })
}
