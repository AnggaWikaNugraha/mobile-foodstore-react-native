import { useState } from 'react'
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RouteProp } from '@react-navigation/native'

import useAuthStore from '../../store/authStore'
import { useTheme, useThemeName, useSetTheme } from '../../hooks/useTheme'
import { useOrders } from '../../hooks/useOrders'
import { useWishlist, useRemoveWishlist } from '../../hooks/useWishlist'
import { useDeliveryAddresses, useDeleteAddress } from '../../hooks/useDeliveryAddresses'
import { DeliveryAddress } from '../../types/address'
import { ThemeName } from '../../constants/themes'
import { MainStackParamList } from '../../types/navigation'
import { Order, OrderStatus } from '../../types/order'
import { getImageUrl } from '../../lib/utils'
import AddressFormModal from '../../components/address/AddressFormModal'

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Profile'>
  route: RouteProp<MainStackParamList, 'Profile'>
}

type Tab = 'biodata' | 'alamat' | 'riwayat' | 'wishlist' | 'keamanan'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'biodata', label: 'Biodata Diri', icon: 'person-outline' },
  { key: 'alamat', label: 'Alamat Pengiriman', icon: 'location-outline' },
  { key: 'riwayat', label: 'Riwayat Belanja', icon: 'receipt-outline' },
  { key: 'wishlist', label: 'Favorit', icon: 'heart-outline' },
  { key: 'keamanan', label: 'Keamanan', icon: 'lock-closed-outline' },
]

const THEMES: { name: ThemeName; label: string; color: string }[] = [
  { name: 'greenFern', label: 'Green Fern', color: '#388E3C' },
  { name: 'greenJade', label: 'Green Jade', color: '#00796B' },
  { name: 'red', label: 'Merah', color: '#c0392b' },
  { name: 'blue', label: 'Biru', color: '#3b82f6' },
  { name: 'orange', label: 'Orange', color: '#f97316' },
]

const formatPrice = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

function orderTotal(order: Order): number {
  const itemsTotal = (order.order_items as any[]).reduce((s: number, i: any) =>
    typeof i === 'string' ? s : s + (i.price ?? 0) * (i.qty ?? 1), 0)
  return itemsTotal + order.delivery_fee
}

const STATUS_BADGE: Record<OrderStatus, { label: string; color: string }> = {
  waiting_payment:   { label: 'Menunggu', color: '#f59e0b' },
  payment_confirmed: { label: 'Diproses', color: '#3b82f6' },
  processing:        { label: 'Diproses', color: '#3b82f6' },
  in_delivery:       { label: 'Dikirim',  color: '#8b5cf6' },
  delivered:         { label: 'Lunas',    color: '#22c55e' },
  failed:            { label: 'Gagal',    color: '#ef4444' },
  expired:           { label: 'Gagal',    color: '#ef4444' },
}

export default function ProfileScreen({ navigation, route }: Props) {
  const { user, logout } = useAuthStore()
  const t = useTheme()
  const themeName = useThemeName()
  const setTheme = useSetTheme()
  const [activeTab, setActiveTab] = useState<Tab>(route.params?.initialTab ?? 'biodata')

  const { data: rawOrders, isLoading: loadingOrders } = useOrders()
  const orders = Array.isArray(rawOrders) ? rawOrders : []
  const waitingOrders = orders.filter(o => o.status === 'waiting_payment')
  const [bannerExpanded, setBannerExpanded] = useState(false)

  const { data: wishlistItems, isLoading: loadingWishlist } = useWishlist()
  const removeWishlist = useRemoveWishlist()

  const { data: addresses = [], isLoading: loadingAddresses } = useDeliveryAddresses()
  const deleteAddress = useDeleteAddress()
  const [addressForm, setAddressForm] = useState<{ visible: boolean; editing: DeliveryAddress | null }>({ visible: false, editing: null })

  const initials = user?.full_name
    ? user.full_name.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('')
    : '?'

  const handleLogout = () => {
    Alert.alert('Logout', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: t.primary }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.heroName}>{user?.full_name}</Text>
          <Text style={styles.heroEmail}>{user?.email}</Text>
          {user?.customer_no && (
            <View style={styles.customerBadge}>
              <Text style={styles.customerBadgeText}>Customer #{user.customer_no}</Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          <View style={styles.tabs}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={activeTab === tab.key ? t.primary : '#888'}
                />
                <Text style={[styles.tabLabel, activeTab === tab.key && { color: t.primary, fontWeight: '600' }]}>
                  {tab.label}
                </Text>
                {activeTab === tab.key && <View style={[styles.tabIndicator, { backgroundColor: t.primary }]} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.tabItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={t.primary} />
              <Text style={[styles.tabLabel, { color: t.primary }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === 'biodata' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Biodata Diri</Text>
              <Text style={styles.cardSubtitle}>Informasi dasar akun Anda</Text>

              <View style={styles.divider} />

              <InfoRow label="Nama Lengkap" value={user?.full_name ?? '-'} />
              <InfoRow
                label="Email"
                value={user?.email ?? '-'}
                badge={user?.email_verified ? 'Terverifikasi' : 'Belum Verifikasi'}
                badgeColor={user?.email_verified ? t.success : t.warning}
              />
              <InfoRow label="Role" value={user?.role === 'admin' ? 'Admin' : 'User'} />
              {user?.customer_no && (
                <InfoRow label="Customer ID" value={`#${user.customer_no}`} />
              )}
              <InfoRow label="Login via Google" value={user?.google_id ? 'Ya' : 'Tidak'} last />
            </View>
          )}

          {activeTab === 'alamat' && (
            <View>
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>Alamat Pengiriman</Text>
                  <TouchableOpacity
                    style={[styles.addAddressBtn, { backgroundColor: t.primary }]}
                    onPress={() => setAddressForm({ visible: true, editing: null })}
                  >
                    <Ionicons name="add" size={16} color="#fff" />
                    <Text style={styles.addAddressBtnText}>Tambah</Text>
                  </TouchableOpacity>
                </View>

                {loadingAddresses && <ActivityIndicator color={t.primary} style={{ marginTop: 12 }} />}

                {!loadingAddresses && addresses.length === 0 && (
                  <Text style={[styles.cardSubtitle, { marginTop: 8 }]}>Belum ada alamat tersimpan.</Text>
                )}

                {addresses.map((addr, i) => (
                  <View key={addr._id} style={[styles.addressRow, i === 0 && { borderTopWidth: 0 }]}>
                    <View style={styles.addressIcon}>
                      <Ionicons name="location-outline" size={18} color={t.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.addressNama}>{addr.nama}</Text>
                      <Text style={[styles.addressLine, { color: t.textMuted }]}>
                        {[addr.kelurahan, addr.kecamatan, addr.kabupaten, addr.provinsi].filter(Boolean).join(', ')}
                      </Text>
                      <Text style={[styles.addressDetail, { color: t.textMuted }]}>{addr.detail}</Text>
                    </View>
                    <View style={styles.addressActions}>
                      <TouchableOpacity
                        onPress={() => setAddressForm({ visible: true, editing: addr })}
                        style={styles.addressActionBtn}
                      >
                        <Ionicons name="pencil-outline" size={16} color="#888" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => Alert.alert('Hapus Alamat', `Hapus "${addr.nama}"?`, [
                          { text: 'Batal', style: 'cancel' },
                          { text: 'Hapus', style: 'destructive', onPress: () => deleteAddress.mutate(addr._id) },
                        ])}
                        style={styles.addressActionBtn}
                      >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              <AddressFormModal
                visible={addressForm.visible}
                editing={addressForm.editing}
                onClose={() => setAddressForm({ visible: false, editing: null })}
              />
            </View>
          )}

          {activeTab === 'riwayat' && (
            <View>
              {waitingOrders.length > 0 && (
                <View style={[styles.waitingBanner, { backgroundColor: '#fff8ec', borderColor: '#f59e0b' }]}>
                  <TouchableOpacity
                    style={styles.waitingBannerRow}
                    onPress={() => setBannerExpanded(v => !v)}
                  >
                    <Ionicons name="hourglass-outline" size={18} color="#f59e0b" />
                    <Text style={[styles.waitingBannerText, { color: '#b45309' }]}>
                      {waitingOrders.length} pesanan menunggu pembayaran
                    </Text>
                    <Ionicons
                      name={bannerExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16} color="#f59e0b"
                    />
                  </TouchableOpacity>

                  {bannerExpanded && waitingOrders.map(order => (
                    <TouchableOpacity
                      key={order._id}
                      style={styles.waitingBannerItem}
                      onPress={() => navigation.navigate('Invoice', { orderId: order._id })}
                    >
                      <Ionicons name="receipt-outline" size={14} color="#b45309" />
                      <Text style={[styles.waitingBannerItemText, { color: '#b45309' }]}>
                        Order #{order.order_number}
                      </Text>
                      <Text style={[styles.waitingBannerItemDate, { color: '#d97706' }]}>
                        {formatDate(order.createdAt)}
                      </Text>
                      <Ionicons name="chevron-forward" size={13} color="#f59e0b" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={[styles.card, { marginTop: 12 }]}>
                <Text style={styles.cardTitle}>Riwayat Belanja</Text>
                {loadingOrders
                  ? <ActivityIndicator color={t.primary} style={{ marginTop: 16 }} />
                  : !orders?.length
                    ? <Text style={[styles.cardSubtitle, { marginTop: 8 }]}>Belum ada transaksi.</Text>
                    : <>
                        <Text style={styles.cardSubtitle}>{orders.length} transaksi tercatat</Text>
                        {orders.map((order) => {
                          const badge = STATUS_BADGE[order.status]
                          return (
                            <TouchableOpacity
                              key={order._id}
                              style={styles.orderRow}
                              onPress={() => navigation.navigate('Invoice', { orderId: order._id })}
                            >
                              <View style={styles.orderThumb}>
                                <Ionicons name="receipt-outline" size={18} color="#aaa" />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.orderNumber}>Order #{order.order_number}</Text>
                                <Text style={[styles.orderDate, { color: t.textMuted }]}>
                                  {formatDate(order.createdAt)}
                                </Text>
                              </View>
                              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                <Text style={styles.orderTotal}>{formatPrice(orderTotal(order))}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: badge.color + '20' }]}>
                                  <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                                    {badge.label}
                                  </Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          )
                        })}
                      </>
                }
              </View>
            </View>
          )}

          {activeTab === 'wishlist' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Favorit</Text>
              {loadingWishlist ? (
                <ActivityIndicator color={t.primary} style={{ marginTop: 16 }} />
              ) : !wishlistItems?.length ? (
                <View style={styles.emptyWishlist}>
                  <Ionicons name="heart-outline" size={40} color="#ddd" />
                  <Text style={styles.emptyWishlistText}>Belum ada produk favorit</Text>
                </View>
              ) : (
                wishlistItems.map(item => (
                  <TouchableOpacity key={item._id} style={styles.wishlistRow} onPress={() => navigation.navigate('ProductDetail', { productId: item.product._id, name: item.product.name })}>
                    <Image
                      source={{ uri: getImageUrl(item.product.image_url) }}
                      style={styles.wishlistThumb}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.wishlistName} numberOfLines={2}>{item.product.name}</Text>
                      <Text style={[styles.wishlistPrice, { color: t.primary }]}>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.product.price)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeWishlist.mutate(item.product._id)}
                      style={styles.removeWishlist}
                    >
                      <Ionicons name="heart" size={22} color="#ef4444" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {activeTab === 'keamanan' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tema Warna</Text>
              <Text style={styles.cardSubtitle}>Pilih warna aplikasi</Text>
              <View style={styles.divider} />
              <View style={styles.themeRow}>
                {THEMES.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    style={styles.themeItem}
                    onPress={() => setTheme(item.name)}
                  >
                    <View style={[
                      styles.themeCircle,
                      { backgroundColor: item.color },
                      themeName === item.name && styles.themeCircleActive,
                    ]}>
                      {themeName === item.name && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <Text style={[
                      styles.themeLabel,
                      themeName === item.name && { color: t.primary, fontWeight: '700' }
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function InfoRow({
  label, value, badge, badgeColor, last
}: {
  label: string
  value: string
  badge?: string
  badgeColor?: string
  last?: boolean
}) {
  return (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueRow}>
        <Text style={styles.infoValue}>{value}</Text>
        {badge && (
          <View style={[styles.badge, { backgroundColor: badgeColor + '20' }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hero: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingBottom: 28,
    paddingTop: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 10,
  },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '700' },
  heroName: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 2 },
  heroEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 8 },
  customerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  customerBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  tabsScroll: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  tabs: { flexDirection: 'row', paddingHorizontal: 8 },
  tabItem: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: 'relative',
    gap: 4,
  },
  tabLabel: { fontSize: 11, color: '#888', textAlign: 'center' },
  tabLabelActive: { fontWeight: '600' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: 'transparent',
    borderRadius: 2,
  },
  content: { padding: 16 },
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  cardSubtitle: { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoLabel: { fontSize: 14, color: '#888' },
  infoValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  themeItem: {
    alignItems: 'center',
    gap: 8,
  },
  themeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeCircleActive: {
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  themeLabel: {
    fontSize: 12,
    color: '#888',
  },
  waitingBanner: {
    borderWidth: 1, borderRadius: 10, overflow: 'hidden',
  },
  waitingBannerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12,
  },
  waitingBannerText: { flex: 1, fontSize: 13, fontWeight: '600' },
  waitingBannerItem: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#fde68a',
  },
  waitingBannerItemText: { fontSize: 13, fontWeight: '600' },
  waitingBannerItemDate: { fontSize: 12 },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f5f5f5',
  },
  orderThumb: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: '#f4f4f4', justifyContent: 'center', alignItems: 'center',
  },
  orderNumber: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  orderDate: { fontSize: 12, marginTop: 2 },
  orderTotal: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  emptyWishlist: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyWishlistText: { fontSize: 14, color: '#aaa' },
  wishlistRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f5f5f5',
  },
  wishlistThumb: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#f4f4f4' },
  wishlistName: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  wishlistPrice: { fontSize: 13, fontWeight: '700' },
  removeWishlist: { padding: 6 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  addAddressBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  addAddressBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  addressRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f5f5f5',
  },
  addressIcon: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: '#f0fdf4',
    justifyContent: 'center', alignItems: 'center',
  },
  addressNama: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  addressLine: { fontSize: 12, marginBottom: 2 },
  addressDetail: { fontSize: 12 },
  addressActions: { flexDirection: 'row', gap: 4 },
  addressActionBtn: { padding: 6 },
})
