import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert, Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { WebView, WebViewMessageEvent } from 'react-native-webview'
import { buildSnapHtml } from '../../lib/snapHtml'

import { useTheme } from '../../hooks/useTheme'
import { useCart } from '../../hooks/useCart'
import { useDeliveryAddresses } from '../../hooks/useDeliveryAddresses'
import { useCreateOrder } from '../../hooks/useCreateOrder'
import { useGetPaymentToken } from '../../hooks/useCreatePayment'
import { useVerifyPayment } from '../../hooks/useVerifyPayment'
import { getImageUrl } from '../../lib/utils'
import { DeliveryAddress } from '../../types/address'
import { MainStackParamList } from '../../types/navigation'

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Checkout'>
}

const DELIVERY_FEE = 20000

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price)

type Step = 1 | 2 | 3

export default function CheckoutScreen({ navigation }: Props) {
  const t = useTheme()
  const [step, setStep] = useState<Step>(1)
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null)

  const [snapToken, setSnapToken] = useState<string | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)

  const { data: cart } = useCart()
  const { data: addresses, isLoading: loadingAddresses } = useDeliveryAddresses()

  const createOrder = useCreateOrder()
  const getPaymentToken = useGetPaymentToken()
  const verifyPayment = useVerifyPayment()

  const isSubmitting = createOrder.isPending || getPaymentToken.isPending

  // Hanya item yang checked
  const checkedItems = (cart ?? []).filter(i => i.checked !== false)
  const subtotal = checkedItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const total = subtotal + DELIVERY_FEE

  const handleOrder = async () => {
    if (!selectedAddress) return
    try {
      const order = await createOrder.mutateAsync({
        delivery_fee: DELIVERY_FEE,
        delivery_address: selectedAddress._id,
      })
      setCurrentOrderId(order._id)
      const { snap_token } = await getPaymentToken.mutateAsync(order._id)
      setSnapToken(snap_token)
    } catch {
      Alert.alert('Gagal', 'Gagal membuat pesanan, coba lagi')
    }
  }

  const handlePaymentMessage = (event: WebViewMessageEvent) => {
    try {
      const { type } = JSON.parse(event.nativeEvent.data) as { type: string }
      if (type === 'success' || type === 'pending') {
        setSnapToken(null)
        if (currentOrderId) verifyPayment.mutate(currentOrderId)
        Alert.alert(
          type === 'success' ? 'Pembayaran Berhasil!' : 'Menunggu Pembayaran',
          type === 'success' ? 'Pesananmu sedang diproses.' : 'Selesaikan pembayaran sesuai instruksi.',
          [{ text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }) }]
        )
      } else if (type === 'error') {
        setSnapToken(null)
        Alert.alert('Pembayaran Gagal', 'Terjadi kesalahan saat pembayaran.')
      } else if (type === 'close') {
        setSnapToken(null)
      }
    } catch { /* ignore malformed messages */ }
  }

  return (
    <>
    <Modal visible={!!snapToken} animationType="slide" onRequestClose={() => setSnapToken(null)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
        <View style={[styles.header, { backgroundColor: t.primary }]}>
          <TouchableOpacity onPress={() => setSnapToken(null)}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pembayaran</Text>
          <View style={{ width: 22 }} />
        </View>
        {snapToken && (
          <WebView
            source={{ html: buildSnapHtml(snapToken), baseUrl: 'https://app.sandbox.midtrans.com' }}
            onMessage={handlePaymentMessage}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color={t.primary} />
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>

    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.primary }]}>
        <TouchableOpacity onPress={() => step === 1 ? navigation.goBack() : setStep(s => (s - 1) as Step)}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Stepper */}
      <View style={styles.stepper}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={styles.stepperItem}>
            <View style={[
              styles.stepCircle,
              step >= s && { backgroundColor: t.primary },
              step > s && { backgroundColor: t.primary },
            ]}>
              {step > s
                ? <Ionicons name="checkmark" size={14} color="#fff" />
                : <Text style={[styles.stepNumber, step >= s && { color: '#fff' }]}>{s}</Text>
              }
            </View>
            {s < 3 && (
              <View style={[styles.stepLine, step > s && { backgroundColor: t.primary }]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step 1 — Item Pesanan */}
        {step === 1 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="cart-outline" size={18} color={t.textMuted} />
              <Text style={styles.cardTitle}>Item Pesanan</Text>
              <Text style={[styles.cardSub, { color: t.textMuted }]}>{checkedItems.length} produk dipilih</Text>
            </View>
            {checkedItems.map(item => (
              <View key={item._id} style={styles.itemRow}>
                <Image source={{ uri: getImageUrl(item.image_url) }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={[styles.itemPrice, { color: t.textMuted }]}>@ {formatPrice(item.price)}</Text>
                </View>
                <Text style={styles.itemQty}>x{item.qty}</Text>
                <Text style={[styles.itemTotal, { color: t.primary }]}>{formatPrice(item.price * item.qty)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Step 2 — Pilih Alamat */}
        {step === 2 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={18} color={t.textMuted} />
              <Text style={styles.cardTitle}>Pilih Alamat Pengiriman</Text>
            </View>
            <Text style={[styles.cardSub, { color: t.textMuted, marginBottom: 12 }]}>
              Pilih salah satu alamat di bawah
            </Text>

            <TouchableOpacity style={[styles.addAddressBtn, { borderColor: t.primary }]}>
              <Ionicons name="add" size={16} color={t.primary} />
              <Text style={[styles.addAddressText, { color: t.primary }]}>+ Tambah Alamat</Text>
            </TouchableOpacity>

            {loadingAddresses ? (
              <ActivityIndicator color={t.primary} style={{ marginTop: 20 }} />
            ) : (
              addresses?.map(addr => (
                <TouchableOpacity
                  key={addr._id}
                  style={[
                    styles.addressCard,
                    selectedAddress?._id === addr._id && { borderColor: t.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setSelectedAddress(addr)}
                >
                  <View style={styles.addressLeft}>
                    <View style={[
                      styles.radio,
                      selectedAddress?._id === addr._id && { borderColor: t.primary },
                    ]}>
                      {selectedAddress?._id === addr._id && (
                        <View style={[styles.radioDot, { backgroundColor: t.primary }]} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addressName}>{addr.nama}</Text>
                      <Text style={[styles.addressDetail, { color: t.textMuted }]}>
                        {addr.kelurahan?.toUpperCase()}, {addr.kecamatan?.toUpperCase()}, {addr.kabupaten?.toUpperCase()}, {addr.provinsi?.toUpperCase()}
                      </Text>
                      <Text style={[styles.addressDetail, { color: t.textMuted }]}>{addr.detail}</Text>
                    </View>
                  </View>
                  {selectedAddress?._id === addr._id && (
                    <Ionicons name="checkmark-circle" size={22} color={t.primary} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Step 3 — Konfirmasi */}
        {step === 3 && selectedAddress && (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>ALAMAT PENGIRIMAN</Text>
              <View style={styles.confirmAddressRow}>
                <Ionicons name="location" size={16} color={t.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressName}>{selectedAddress.nama}</Text>
                  <Text style={[styles.addressDetail, { color: t.textMuted }]}>
                    {selectedAddress.kelurahan?.toUpperCase()}, {selectedAddress.kecamatan?.toUpperCase()}, {selectedAddress.kabupaten?.toUpperCase()}, {selectedAddress.provinsi?.toUpperCase()}
                  </Text>
                  <Text style={[styles.addressDetail, { color: t.textMuted }]}>{selectedAddress.detail}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionLabel}>ITEM PESANAN</Text>
              {checkedItems.map(item => (
                <View key={item._id} style={styles.itemRow}>
                  <Image source={{ uri: getImageUrl(item.image_url) }} style={styles.itemImage} />
                  <Text style={[styles.itemName, { flex: 1 }]}>{item.name}</Text>
                  <Text style={styles.itemQty}>x{item.qty}</Text>
                  <Text style={[styles.itemTotal, { color: t.text }]}>{formatPrice(item.price * item.qty)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionLabel}>RINCIAN HARGA</Text>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: t.textMuted }]}>Subtotal</Text>
                <Text style={styles.priceValue}>{formatPrice(subtotal)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: t.textMuted }]}>Ongkos Kirim</Text>
                <Text style={styles.priceValue}>{formatPrice(DELIVERY_FEE)}</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Pembayaran</Text>
                <Text style={[styles.totalValue, { color: t.primary }]}>{formatPrice(total)}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: t.border }]}
            onPress={() => setStep(s => (s - 1) as Step)}
          >
            <Ionicons name="arrow-back" size={16} color={t.text} />
            <Text style={[styles.backBtnText, { color: t.text }]}>Sebelumnya</Text>
          </TouchableOpacity>
        )}

        {step < 3 ? (
          <TouchableOpacity
            style={[
              styles.nextBtn,
              { backgroundColor: t.primary },
              step === 2 && !selectedAddress && { opacity: 0.5 },
            ]}
            disabled={step === 2 && !selectedAddress}
            onPress={() => setStep(s => (s + 1) as Step)}
          >
            <Text style={styles.nextBtnText}>Selanjutnya →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: t.primary }, isSubmitting && { opacity: 0.6 }]}
            disabled={isSubmitting}
            onPress={handleOrder}
          >
            {isSubmitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.nextBtnText}>💳 Bayar Sekarang</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepperItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: { fontSize: 13, fontWeight: '700', color: '#888' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#e0e0e0', marginHorizontal: 4 },
  content: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  cardSub: { fontSize: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  itemImage: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#f5f5f5' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  itemPrice: { fontSize: 12, marginTop: 2 },
  itemQty: { fontSize: 13, color: '#888' },
  itemTotal: { fontSize: 13, fontWeight: '700', minWidth: 70, textAlign: 'right' },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  addAddressText: { fontSize: 13, fontWeight: '600' },
  addressCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  addressName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  addressDetail: { fontSize: 12, lineHeight: 18 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', letterSpacing: 1, marginBottom: 10 },
  confirmAddressRow: { flexDirection: 'row', gap: 10 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#f0f0f0', marginTop: 6, paddingTop: 10 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  totalValue: { fontSize: 16, fontWeight: '800' },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtnText: { fontSize: 14, fontWeight: '600' },
  nextBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  webviewLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})
