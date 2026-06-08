import { useState, useEffect } from 'react'
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../hooks/useTheme'
import { useCreateAddress, useUpdateAddress, AddressPayload } from '../../hooks/useDeliveryAddresses'
import { useProvinsi, useKabupaten, useKecamatan, useDesa, WilayahItem } from '../../hooks/useWilayah'
import { DeliveryAddress } from '../../types/address'
import RegionPicker from './RegionPicker'

interface Props {
  visible: boolean
  editing?: DeliveryAddress | null
  onClose: () => void
}

interface SelectedRegion {
  provinsi: WilayahItem | null
  kabupaten: WilayahItem | null
  kecamatan: WilayahItem | null
  kelurahan: WilayahItem | null
}

const EMPTY_REGION: SelectedRegion = { provinsi: null, kabupaten: null, kecamatan: null, kelurahan: null }

export default function AddressFormModal({ visible, editing, onClose }: Props) {
  const t = useTheme()
  const [nama, setNama] = useState('')
  const [detail, setDetail] = useState('')
  const [region, setRegion] = useState<SelectedRegion>(EMPTY_REGION)

  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()

  const { data: provinsiList = [], isLoading: loadProvinsi } = useProvinsi()
  const { data: kabupatenList = [], isLoading: loadKabupaten } = useKabupaten(region.provinsi?.kode ?? '')
  const { data: kecamatanList = [], isLoading: loadKecamatan } = useKecamatan(region.kabupaten?.kode ?? '')
  const { data: desaList = [], isLoading: loadDesa } = useDesa(region.kecamatan?.kode ?? '')

  const isPending = createAddress.isPending || updateAddress.isPending

  useEffect(() => {
    if (visible) {
      if (editing) {
        setNama(editing.nama)
        setDetail(editing.detail)
        // When editing, show existing names — user can re-pick to change
        setRegion({
          provinsi: editing.provinsi ? { kode: '', nama: editing.provinsi } : null,
          kabupaten: editing.kabupaten ? { kode: '', nama: editing.kabupaten } : null,
          kecamatan: editing.kecamatan ? { kode: '', nama: editing.kecamatan } : null,
          kelurahan: editing.kelurahan ? { kode: '', nama: editing.kelurahan } : null,
        })
      } else {
        setNama('')
        setDetail('')
        setRegion(EMPTY_REGION)
      }
    }
  }, [visible, editing])

  const pickProvinsi = (item: WilayahItem) =>
    setRegion({ provinsi: item, kabupaten: null, kecamatan: null, kelurahan: null })

  const pickKabupaten = (item: WilayahItem) =>
    setRegion(r => ({ ...r, kabupaten: item, kecamatan: null, kelurahan: null }))

  const pickKecamatan = (item: WilayahItem) =>
    setRegion(r => ({ ...r, kecamatan: item, kelurahan: null }))

  const pickKelurahan = (item: WilayahItem) =>
    setRegion(r => ({ ...r, kelurahan: item }))

  const isValid =
    nama.trim() &&
    region.provinsi?.nama && region.kabupaten?.nama &&
    region.kecamatan?.nama && region.kelurahan?.nama &&
    detail.trim()

  const handleSubmit = async () => {
    if (!isValid) return
    const payload: AddressPayload = {
      nama: nama.trim(),
      provinsi: region.provinsi!.nama,
      kabupaten: region.kabupaten!.nama,
      kecamatan: region.kecamatan!.nama,
      kelurahan: region.kelurahan!.nama,
      detail: detail.trim(),
    }
    try {
      if (editing) {
        await updateAddress.mutateAsync({ id: editing._id, ...payload })
      } else {
        await createAddress.mutateAsync(payload)
      }
      onClose()
    } catch (err: any) {
      Alert.alert('Gagal', err?.message ?? 'Gagal menyimpan alamat')
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <View style={styles.drag} />
          <View style={styles.header}>
            <Text style={styles.title}>{editing ? 'Edit Alamat' : 'Tambah Alamat'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#888" />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>Label Alamat</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Rumah, Kantor"
              value={nama}
              onChangeText={setNama}
            />

            <Text style={styles.fieldLabel}>Wilayah</Text>
            <RegionPicker
              label="Provinsi"
              value={region.provinsi?.nama ?? ''}
              options={provinsiList}
              loading={loadProvinsi}
              onSelect={pickProvinsi}
            />
            <RegionPicker
              label="Kabupaten / Kota"
              value={region.kabupaten?.nama ?? ''}
              options={kabupatenList}
              loading={loadKabupaten}
              disabled={!region.provinsi?.kode}
              onSelect={pickKabupaten}
            />
            <RegionPicker
              label="Kecamatan"
              value={region.kecamatan?.nama ?? ''}
              options={kecamatanList}
              loading={loadKecamatan}
              disabled={!region.kabupaten?.kode}
              onSelect={pickKecamatan}
            />
            <RegionPicker
              label="Kelurahan / Desa"
              value={region.kelurahan?.nama ?? ''}
              options={desaList}
              loading={loadDesa}
              disabled={!region.kecamatan?.kode}
              onSelect={pickKelurahan}
            />

            <Text style={styles.fieldLabel}>Detail Alamat</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
              value={detail}
              onChangeText={setDetail}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: isValid ? t.primary : '#ccc', opacity: isPending ? 0.7 : 1 }]}
              onPress={handleSubmit}
              disabled={!isValid || isPending}
            >
              {isPending
                ? <ActivityIndicator size={18} color="#fff" />
                : <Text style={styles.submitText}>{editing ? 'Simpan Perubahan' : 'Tambah Alamat'}</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#f8f8f8', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 16, paddingBottom: 32, maxHeight: '90%',
  },
  drag: {
    width: 40, height: 4, backgroundColor: '#e0e0e0',
    borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 12,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0',
    borderRadius: 10, padding: 12, fontSize: 14, color: '#1a1a1a', marginBottom: 10,
  },
  inputMulti: { minHeight: 80 },
  submitBtn: {
    borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
})
