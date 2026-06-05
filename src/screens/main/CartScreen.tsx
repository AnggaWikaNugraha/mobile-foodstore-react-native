import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useIsMutating } from '@tanstack/react-query'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCart, useUpdateCart } from '../../hooks/useCart'
import { useTheme } from '../../hooks/useTheme'
import { getImageUrl } from '../../lib/utils'
import { CartItem, CartPayloadItem } from '../../types/cart'
import { MainStackParamList } from '../../types/navigation'

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Cart'>
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)

export default function CartScreen({ navigation }: Props) {
  const t = useTheme()
  const { data: cart, isLoading, isFetching } = useCart()
  const updateCart = useUpdateCart()
  const isMutating = useIsMutating({ mutationKey: ['cart'] }) > 0
  const isCartLoading = isFetching || isMutating

  const items: CartItem[] = cart ?? []

  const checkedItems = items.filter(i => i.checked !== false)
  const allChecked = items.length > 0 && items.every(i => i.checked !== false)
  const subtotal = checkedItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const deliveryFee = checkedItems.length > 0 ? 20000 : 0
  const total = subtotal + deliveryFee

  const buildPayload = (updated: CartItem[]): CartPayloadItem[] =>
    updated.map(i => ({
      _id: i._id,
      name: i.name,
      price: i.price,
      image_url: i.image_url,
      qty: i.qty,
      checked: i.checked ?? true,
    }))

  const toggleAll = () => {
    const next = !allChecked
    const updated = items.map(i => ({ ...i, checked: next }))
    updateCart.mutate(buildPayload(updated))
  }

  const toggleItem = (id: string) => {
    const updated = items.map(i => i._id === id ? { ...i, checked: !i.checked } : i)
    updateCart.mutate(buildPayload(updated))
  }

  const updateQty = (productId: string, qty: number) => {
    const updated = qty === 0
      ? items.filter(i => i._id !== productId)
      : items.map(i => i._id === productId ? { ...i, qty } : i)
    updateCart.mutate(buildPayload(updated))
  }

  const deleteChecked = () => {
    const updated = items.filter(i => i.checked === false)
    updateCart.mutate(buildPayload(updated))
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={t.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Keranjang</Text>
        {isCartLoading
          ? <ActivityIndicator size={18} color="#fff" />
          : <View style={{ width: 22 }} />
        }
      </View>

      {items.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="cart-outline" size={64} color="#ddd" />
          <Text style={styles.emptyText}>Keranjang kosong</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, isCartLoading && styles.cardDisabled]}>
              <TouchableOpacity onPress={() => toggleItem(item._id)}>
                <View style={[styles.checkbox, item.checked !== false && { backgroundColor: t.primary, borderColor: t.primary }]}>
                  {item.checked !== false && <Ionicons name="checkmark" size={13} color="#fff" />}
                </View>
              </TouchableOpacity>

              <Image source={{ uri: getImageUrl(item.image_url) }} style={styles.image} resizeMode="cover" />

              <View style={styles.info}>
                <TouchableOpacity style={styles.deleteIcon} onPress={() => updateQty(item._id, 0)} disabled={isCartLoading}>
                  <Ionicons name="trash-outline" size={16} color="#ccc" />
                </TouchableOpacity>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={[styles.price, { color: t.textMuted }]}>{formatPrice(item.price)} / pcs</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { borderColor: t.primary }]}
                    onPress={() => updateQty(item._id, item.qty - 1)}
                    disabled={isCartLoading}
                  >
                    <Ionicons name="remove" size={14} color={t.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.qty}</Text>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { borderColor: t.primary }]}
                    onPress={() => updateQty(item._id, item.qty + 1)}
                    disabled={isCartLoading}
                  >
                    <Ionicons name="add" size={14} color={t.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.subtotalItem, { color: t.primary }]}>
                {formatPrice(item.price * item.qty)}
              </Text>
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.selectAllRow}>
              <TouchableOpacity style={styles.selectAllLeft} onPress={toggleAll}>
                <View style={[styles.checkbox, allChecked && { backgroundColor: t.primary, borderColor: t.primary }]}>
                  {allChecked && <Ionicons name="checkmark" size={13} color="#fff" />}
                </View>
                <Text style={styles.selectAllText}>Pilih Semua ({items.length})</Text>
              </TouchableOpacity>
              {checkedItems.length > 0 && (
                <TouchableOpacity onPress={deleteChecked} disabled={isCartLoading}>
                  <Text style={[styles.deleteText, { color: t.primary }]}>Hapus</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListFooterComponent={
            checkedItems.length > 0 ? (
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Ringkasan belanja</Text>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: t.textMuted }]}>
                    Subtotal ({checkedItems.length} item)
                  </Text>
                  <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: t.textMuted }]}>Ongkos kirim</Text>
                  <Text style={styles.summaryValue}>{formatPrice(deliveryFee)}</Text>
                </View>
                <View style={[styles.divider, { marginVertical: 8 }]} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.buyBtn, { backgroundColor: t.primary }]}
                  onPress={() => navigation.navigate('Checkout')}
                >
                  <Text style={styles.buyBtnText}>Beli ({checkedItems.length})</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { color: '#aaa', fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  list: { padding: 12, gap: 10 },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 2,
  },
  selectAllLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectAllText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  deleteText: { fontSize: 14, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  cardDisabled: { opacity: 0.6 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#f5f5f5' },
  info: { flex: 1 },
  deleteIcon: { alignSelf: 'flex-end', marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  price: { fontSize: 12, marginBottom: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: { fontSize: 14, fontWeight: '600', minWidth: 20, textAlign: 'center' },
  subtotalItem: { fontSize: 13, fontWeight: '700', alignSelf: 'flex-end' },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  totalValue: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  buyBtn: {
    marginTop: 14,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
