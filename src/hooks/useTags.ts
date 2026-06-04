import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

interface Tag {
  _id: string
  name: string
}

export function useTags() {
  return useQuery<{ data: Tag[] }>({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await api.get('/api/tags')
      return res.data
    },
  })
}
