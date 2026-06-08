import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

export interface WilayahItem {
  kode: string
  nama: string
}

export function useProvinsi() {
  return useQuery<WilayahItem[]>({
    queryKey: ['wilayah', 'provinsi'],
    queryFn: () => api.get('/api/wilayah/provinsi').then(res => (res.data?.data ?? res.data ?? []) as WilayahItem[]),
    staleTime: Infinity,
  })
}

export function useKabupaten(kodeProvinsi: string) {
  return useQuery<WilayahItem[]>({
    queryKey: ['wilayah', 'kabupaten', kodeProvinsi],
    queryFn: () =>
      api.get('/api/wilayah/kabupaten', { params: { kode_induk: kodeProvinsi } })
        .then(res => (res.data?.data ?? res.data ?? []) as WilayahItem[]),
    enabled: !!kodeProvinsi,
    staleTime: Infinity,
  })
}

export function useKecamatan(kodeKabupaten: string) {
  return useQuery<WilayahItem[]>({
    queryKey: ['wilayah', 'kecamatan', kodeKabupaten],
    queryFn: () =>
      api.get('/api/wilayah/kecamatan', { params: { kode_induk: kodeKabupaten } })
        .then(res => (res.data?.data ?? res.data ?? []) as WilayahItem[]),
    enabled: !!kodeKabupaten,
    staleTime: Infinity,
  })
}

export function useDesa(kodeKecamatan: string) {
  return useQuery<WilayahItem[]>({
    queryKey: ['wilayah', 'desa', kodeKecamatan],
    queryFn: () =>
      api.get('/api/wilayah/desa', { params: { kode_induk: kodeKecamatan } })
        .then(res => (res.data?.data ?? res.data ?? []) as WilayahItem[]),
    enabled: !!kodeKecamatan,
    staleTime: Infinity,
  })
}
