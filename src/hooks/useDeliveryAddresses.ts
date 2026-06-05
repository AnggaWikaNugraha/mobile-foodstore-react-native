import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import { DeliveryAddress } from '../types/address'
import useAuthStore from '../store/authStore'

export function useDeliveryAddresses() {
  const token = useAuthStore((s) => s.token)

  return useQuery<DeliveryAddress[]>({
    queryKey: ['delivery-addresses'],
    queryFn: async () => {
      const res = await api.get('/api/delivery-addresses')
      return res.data.data
    },
    enabled: !!token,
    initialData: [],
  })
}
