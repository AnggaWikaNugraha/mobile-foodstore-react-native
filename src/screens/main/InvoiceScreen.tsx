import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert, Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'
import { WebView, WebViewMessageEvent } from 'react-native-webview'

import { useTheme } from '../../hooks/useTheme'
import { useOrder } from '../../hooks/useOrder'
import { useGetPaymentToken } from '../../hooks/useCreatePayment'
import { useVerifyPayment } from '../../hooks/useVerifyPayment'
import { useConfirmDelivery } from '../../hooks/useConfirmDelivery'
import { useReviews } from '../../hooks/useReviews'
import { buildSnapHtml } from '../../lib/snapHtml'
import { getImageUrl } from '../../lib/utils'
import { MainStackParamList } from '../../types/navigation'
import { OrderItem, OrderStatus } from '../../types/order'
import useAuthStore from '../../store/authStore'
import ReviewModal from '../../components/order/ReviewModal'

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Invoice'>
  route: RouteProp<MainStackParamList, 'Invoice'>
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'payment_confirmed', label: 'Pembayaran' },
  { key: 'processing',        label: 'Diproses' },
  { key: 'in_delivery',       label: 'Dikirim' },
  { key: 'delivered',         label: 'Diterima' },
]

const STATUS_ORDER: OrderStatus[] = [
  'waiting_payment', 'payment_confirmed', 'processing', 'in_delivery', 'delivered',
]

function getStepIndex(status: OrderStatus): number {
  const idx = STATUS_ORDER.indexOf(status)
  return idx - 1 // step 0 = payment_confirmed
}

const STATUS_INFO: Record<string, { icon: string; color: string; title: string; subtitle: string }> = {
  waiting_payment:   { icon: 'time-outline',          color: '#f59e0b', title: 'Menunggu Pembayaran',    subtitle: 'Segera selesaikan pembayaranmu agar pesanan dapat segera diproses.' },
  payment_confirmed: { icon: 'checkmark-circle',       color: '#22c55e', title: 'Pembayaran Dikonfirmasi', subtitle: 'Pembayaranmu berhasil diterima! Pesanan akan segera diproses oleh tim kami.' },
  processing:        { icon: 'reload-circle',          color: '#3b82f6', title: 'Pesanan Sedang Diproses', subtitle: 'Tim kami sedang menyiapkan pesananmu dengan penuh semangat. Tunggu sebentar ya!' },
  in_delivery:       { icon: 'car',                    color: '#8b5cf6', title: 'Pesanan Dalam Pengiriman', subtitle: 'Paket sudah dalam perjalanan menuju alamatmu. Pastikan ada yang menerima di tempat ya!' },
  delivered:         { icon: 'gift',                   color: '#22c55e', title: 'Pesanan Berhasil Diterima!', subtitle: 'Terima kasih sudah berbelanja di FoodStore. Jangan lupa beri penilaian untuk produk yang kamu beli ya!' },
  failed:            { icon: 'close-circle',           color: '#ef4444', title: 'Pembayaran Gagal',         subtitle: 'Pembayaranmu gagal atau kadaluarsa. Silakan buat pesanan baru.' },
  expired:           { icon: 'close-circle',           color: '#ef4444', title: 'Pembayaran Kadaluarsa',    subtitle: 'Batas waktu pembayaran telah habis. Silakan buat pesanan baru.' },
}

export default function InvoiceScreen({ navigation, route }: Props) {
  const { orderId } = route.params
  const t = useTheme()
  const { user } = useAuthStore()
  const [snapToken, setSnapToken] = useState<string | null>(null)

  const { data: order, isLoading } = useOrder(orderId)
  const getPaymentToken = useGetPaymentToken()
  const verifyPayment = useVerifyPayment()
  const confirmDelivery = useConfirmDelivery()

  const { data: orderReviews } = useReviews({ order_id: orderId })
  const reviewedProductIds = new Set(
    (orderReviews ?? [])
      .filter(r => typeof r.user !== 'string' && r.user._id === user?._id)
      .map(r => r.product_id)
      .filter(Boolean) as string[]
  )
  const [submittedProductIds, setSubmittedProductIds] = useState<Set<string>>(new Set())
  const [reviewTarget, setReviewTarget] = useState<{ productId: string; productName: string } | null>(null)

  const isReviewed = (productId: string) =>
    reviewedProductIds.has(productId) || submittedProductIds.has(productId)

  const handleReviewSuccess = (productId: string) => {
    setSubmittedProductIds(prev => new Set([...prev, productId]))
  }

  const handlePayNow = async () => {
    try {
      const { snap_token } = await getPaymentToken.mutateAsync(orderId)
      setSnapToken(snap_token)
    } catch {
      Alert.alert('Gagal', 'Gagal memuat halaman pembayaran, coba lagi.')
    }
  }

  const handlePaymentMessage = (event: WebViewMessageEvent) => {
    try {
      const { type } = JSON.parse(event.nativeEvent.data) as { type: string }
      if (type === 'success' || type === 'pending') {
        setSnapToken(null)
        verifyPayment.mutate(orderId)
      } else if (type === 'error') {
        setSnapToken(null)
        Alert.alert('Pembayaran Gagal', 'Terjadi kesalahan saat pembayaran.')
      } else if (type === 'close') {
        setSnapToken(null)
      }
    } catch { /* ignore */ }
  }

  const handleConfirmDelivery = () => {
    Alert.alert(
      'Konfirmasi Penerimaan',
      'Apakah kamu sudah menerima pesananmu?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Sudah Diterima',
          onPress: () => confirmDelivery.mutate(orderId),
        },
      ]
    )
  }

  if (isLoading || !order) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <ActivityIndicator size="large" color={t.primary} />
      </SafeAreaView>
    )
  }

  const stepIndex = getStepIndex(order.status)
  const statusInfo = STATUS_INFO[order.status] ?? STATUS_INFO.waiting_payment
  const populatedItems = (order.order_items as any[]).filter((i): i is OrderItem => typeof i !== 'string')
  const subtotal = populatedItems.reduce((s, i) => s + i.price * i.qty, 0)
  const addr = order.delivery_address

  return (
    <>
      {/* Midtrans Modal */}
      <Modal visible={!!snapToken} animationType="slide" onRequestClose={() => setSnapToken(null)}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={[styles.modalHeader, { backgroundColor: t.primary }]}>
            <TouchableOpacity onPress={() => setSnapToken(null)}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pembayaran</Text>
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
                <View style={styles.centered}>
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
          <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Profile', { initialTab: 'riwayat' })}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Riwayat Belanja</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Invoice Card */}
          <View style={[styles.invoiceCard, { backgroundColor: t.primary }]}>
            <View style={styles.invoiceCardTop}>
              <View style={styles.invoiceCardLeft}>
                <Text style={styles.storeName}>FoodStore</Text>
                <Text style={styles.invoiceNumber}>Invoice #{order.order_number}</Text>
              </View>
              {order.status !== 'waiting_payment' && order.status !== 'failed' && order.status !== 'expired' && (
                <View style={styles.lunasBadge}>
                  <Ionicons name="checkmark" size={12} color="#22c55e" />
                  <Text style={styles.lunasBadgeText}>Lunas</Text>
                </View>
              )}
            </View>

            {/* Stepper */}
            <View style={styles.stepper}>
              {STEPS.map((step, i) => {
                const done = stepIndex > i
                const active = stepIndex === i
                return (
                  <View key={step.key} style={styles.stepItem}>
                    <View style={[
                      styles.stepCircle,
                      (done || active) && { backgroundColor: '#fff' },
                    ]}>
                      {done
                        ? <Ionicons name="checkmark" size={12} color={t.primary} />
                        : <View style={[styles.stepDot, active && { backgroundColor: t.primary }]} />
                      }
                    </View>
                    {i < STEPS.length - 1 && (
                      <View style={[styles.stepLine, done && { backgroundColor: '#fff' }]} />
                    )}
                  </View>
                )
              })}
            </View>
            <View style={styles.stepLabels}>
              {STEPS.map((step) => (
                <Text key={step.key} style={styles.stepLabel}>{step.label}</Text>
              ))}
            </View>
          </View>

          {/* Status Banner */}
          <View style={[styles.bannerCard, { borderLeftColor: statusInfo.color }]}>
            <Ionicons name={statusInfo.icon as any} size={28} color={statusInfo.color} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: statusInfo.color }]}>{statusInfo.title}</Text>
              <Text style={styles.bannerSubtitle}>{statusInfo.subtitle}</Text>
            </View>
          </View>

          {/* Bayar Sekarang */}
          {order.status === 'waiting_payment' && (
            <TouchableOpacity
              style={[styles.payBtn, { backgroundColor: t.primary }, getPaymentToken.isPending && { opacity: 0.6 }]}
              disabled={getPaymentToken.isPending}
              onPress={handlePayNow}
            >
              {getPaymentToken.isPending
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.payBtnText}>Bayar Sekarang</Text>
              }
            </TouchableOpacity>
          )}

          {/* Konfirmasi Diterima */}
          {order.status === 'in_delivery' && (
            <TouchableOpacity
              style={[styles.confirmBtn, { borderColor: t.primary }, confirmDelivery.isPending && { opacity: 0.6 }]}
              disabled={confirmDelivery.isPending}
              onPress={handleConfirmDelivery}
            >
              {confirmDelivery.isPending
                ? <ActivityIndicator color={t.primary} />
                : <>
                    <Ionicons name="checkmark-circle-outline" size={18} color={t.primary} />
                    <Text style={[styles.confirmBtnText, { color: t.primary }]}>Konfirmasi Diterima</Text>
                  </>
              }
            </TouchableOpacity>
          )}

          {/* Dikirim ke */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DIKIRIM KE</Text>
            <Text style={styles.sectionValue}>{user?.full_name ?? '-'}</Text>
            <Text style={[styles.sectionSub, { color: t.textMuted }]}>{user?.email ?? '-'}</Text>
            {addr.detail && <Text style={[styles.sectionSub, { color: t.textMuted }]}>{addr.detail}</Text>}
            <Text style={[styles.sectionSub, { color: t.textMuted }]}>
              {[addr.kelurahan, addr.kecamatan, addr.kabupaten, addr.provinsi].filter(Boolean).join(', ').toUpperCase()}
            </Text>
          </View>

          {/* Pembayaran ke */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PEMBAYARAN KE</Text>
            <Text style={styles.sectionValue}>{user?.full_name ?? '-'}</Text>
            <Text style={[styles.sectionSub, { color: t.textMuted }]}>{user?.email ?? '-'}</Text>
          </View>

          {/* Item Pesanan */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ITEM PESANAN</Text>
            {populatedItems.map((item) => (
              <View key={item._id}>
                <View style={styles.itemRow}>
                  {item.image_url
                    ? <Image source={{ uri: getImageUrl(item.image_url) }} style={styles.itemImg} />
                    : <View style={[styles.itemImg, { backgroundColor: '#f0f0f0' }]} />
                  }
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={[styles.itemMeta, { color: t.textMuted }]}>
                      @ {formatPrice(item.price)} x {item.qty}
                    </Text>
                  </View>
                  <Text style={[styles.itemPrice, { color: t.text }]}>{formatPrice(item.price * item.qty)}</Text>
                  {order.status === 'delivered' && !isReviewed(item._id) && (
                    <TouchableOpacity
                      style={[styles.ratingBtn, { borderColor: t.primary }]}
                      onPress={() => setReviewTarget({ productId: item._id, productName: item.name })}
                    >
                      <Text style={[styles.ratingBtnText, { color: t.primary }]}>Beri Rating</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {order.status === 'delivered' && <ProductReviewList productId={item._id} />}
              </View>
            ))}
          </View>

          {/* Ringkasan Harga */}
          <View style={[styles.section, styles.priceSection]}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: t.textMuted }]}>Subtotal</Text>
              <Text style={styles.priceValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: t.textMuted }]}>Ongkos Kirim</Text>
              <Text style={styles.priceValue}>{formatPrice(order.delivery_fee)}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={[styles.totalValue, { color: t.primary }]}>{formatPrice(subtotal + order.delivery_fee)}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {reviewTarget && (
        <ReviewModal
          visible={!!reviewTarget}
          productId={reviewTarget.productId}
          productName={reviewTarget.productName}
          orderId={orderId}
          onClose={() => setReviewTarget(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  )
}

function ProductReviewList({ productId }: { productId: string }) {
  const { data: reviews, isLoading } = useReviews({ product_id: productId })

  if (isLoading) return <ActivityIndicator size={12} style={{ marginVertical: 4 }} />
  if (!reviews?.length) return null

  return (
    <View style={reviewListStyles.container}>
      {reviews.map(r => (
        <View key={r._id} style={reviewListStyles.row}>
          <View style={reviewListStyles.stars}>
            {[1, 2, 3, 4, 5].map(s => (
              <Ionicons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={11} color="#f59e0b" />
            ))}
          </View>
          <Text style={reviewListStyles.userName}>
            {typeof r.user === 'string' ? 'User' : r.user.full_name}
          </Text>
          <Text style={reviewListStyles.comment}>{r.comment}</Text>
        </View>
      ))}
    </View>
  )
}

const reviewListStyles = StyleSheet.create({
  container: { paddingHorizontal: 4, paddingBottom: 8, gap: 8 },
  row: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, gap: 3 },
  stars: { flexDirection: 'row', gap: 2 },
  userName: { fontSize: 12, fontWeight: '700', color: '#374151' },
  comment: { fontSize: 12, color: '#555', lineHeight: 18 },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  content: { padding: 16, gap: 12 },

  // Invoice card
  invoiceCard: { borderRadius: 12, padding: 16 },
  invoiceCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  invoiceCardLeft: {},
  storeName: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 2 },
  invoiceNumber: { color: '#fff', fontSize: 20, fontWeight: '800' },
  lunasBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  lunasBadgeText: { color: '#22c55e', fontSize: 12, fontWeight: '700' },

  // Stepper
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  stepLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 2 },
  stepLabels: { flexDirection: 'row', marginTop: 6 },
  stepLabel: { flex: 1, color: 'rgba(255,255,255,0.8)', fontSize: 10, textAlign: 'center' },

  // Banner
  bannerCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    borderLeftWidth: 4,
  },
  bannerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  bannerSubtitle: { fontSize: 12, color: '#666', lineHeight: 18 },

  // Buttons
  payBtn: {
    borderRadius: 10, paddingVertical: 14, alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  confirmBtn: {
    borderRadius: 10, paddingVertical: 14, alignItems: 'center',
    borderWidth: 2, flexDirection: 'row', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff',
  },
  confirmBtnText: { fontWeight: '700', fontSize: 15 },

  // Sections
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', letterSpacing: 1, marginBottom: 8 },
  sectionValue: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  sectionSub: { fontSize: 12, marginTop: 2, lineHeight: 18 },

  // Items
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  itemImg: { width: 44, height: 44, borderRadius: 8 },
  itemName: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  itemMeta: { fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: '600' },
  ratingBtn: {
    borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
  },
  ratingBtnText: { fontSize: 11, fontWeight: '600' },
  reviewedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#fef9c3', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
  },
  reviewedText: { fontSize: 11, fontWeight: '600', color: '#b45309' },

  // Price summary
  priceSection: {},
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#f0f0f0', marginTop: 4, paddingTop: 10 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  totalValue: { fontSize: 16, fontWeight: '800' },
})
