import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import { DeliveryAddress } from '../types/address'
import useAuthStore from '../store/authStore'

const QK = ['delivery-addresses']

export function useDeliveryAddresses() {
  const token = useAuthStore((s) => s.token)
  return useQuery<DeliveryAddress[]>({
    queryKey: QK,
    queryFn: () => api.get('/api/delivery-addresses').then(res => (res.data?.data ?? res.data ?? []) as DeliveryAddress[]),
    enabled: !!token,
    initialData: [],
  })
}

export type AddressPayload = Omit<DeliveryAddress, '_id'>

export function useCreateAddress() {
  const qc = useQueryClient()
  return useMutation<DeliveryAddress, Error, AddressPayload>({
    mutationFn: (body) =>
      api.post('/api/delivery-addresses', body).then(res => res.data?.data ?? res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useUpdateAddress() {
  const qc = useQueryClient()
  return useMutation<DeliveryAddress, Error, { id: string } & AddressPayload>({
    mutationFn: ({ id, ...body }) =>
      api.put(`/api/delivery-addresses/${id}`, body).then(res => res.data?.data ?? res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}

export function useDeleteAddress() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete(`/api/delivery-addresses/${id}`).then(res => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  })
}
