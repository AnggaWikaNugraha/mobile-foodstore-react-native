import { useState } from 'react'
import {
  Modal, View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { WilayahItem } from '../../hooks/useWilayah'

interface Props {
  label: string
  value: string
  options: WilayahItem[]
  loading?: boolean
  disabled?: boolean
  onSelect: (item: WilayahItem) => void
}

export default function RegionPicker({ label, value, options, loading, disabled, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = search
    ? options.filter(o => o.nama.toLowerCase().includes(search.toLowerCase()))
    : options

  const handleSelect = (item: WilayahItem) => {
    onSelect(item)
    setSearch('')
    setOpen(false)
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.triggerLabel}>{label}</Text>
          <Text style={[styles.triggerValue, !value && styles.placeholder]}>
            {value || `Pilih ${label}`}
          </Text>
        </View>
        {loading
          ? <ActivityIndicator size={14} color="#888" />
          : <Ionicons name="chevron-down" size={16} color={disabled ? '#ccc' : '#888'} />
        }
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Pilih {label}</Text>
              <TouchableOpacity onPress={() => { setSearch(''); setOpen(false) }}>
                <Ionicons name="close" size={22} color="#888" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color="#aaa" />
              <TextInput
                style={styles.searchInput}
                placeholder={`Cari ${label}...`}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              {filtered.length === 0
                ? <Text style={styles.empty}>{loading ? 'Memuat...' : 'Tidak ditemukan'}</Text>
                : filtered.map(item => (
                    <TouchableOpacity
                      key={item.kode}
                      style={[styles.option, item.nama === value && styles.optionActive]}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={[styles.optionText, item.nama === value && styles.optionTextActive]}>
                        {item.nama}
                      </Text>
                      {item.nama === value && <Ionicons name="checkmark" size={16} color="#16a34a" />}
                    </TouchableOpacity>
                  ))
              }
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    padding: 12, marginBottom: 10, backgroundColor: '#fff',
  },
  triggerDisabled: { backgroundColor: '#f9f9f9', borderColor: '#eee' },
  triggerLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  triggerValue: { fontSize: 14, color: '#1a1a1a', fontWeight: '500' },
  placeholder: { color: '#aaa', fontWeight: '400' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '75%',
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 12, backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 12,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#1a1a1a' },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  optionActive: { backgroundColor: '#f0fdf4' },
  optionText: { fontSize: 14, color: '#1a1a1a' },
  optionTextActive: { color: '#16a34a', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#aaa', padding: 24, fontSize: 14 },
})
