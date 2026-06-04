import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useAuthStore from '../../store/authStore'
import { useTheme, useThemeName, useSetTheme } from '../../hooks/useTheme'
import { ThemeName } from '../../constants/themes'
import { MainStackParamList } from '../../types/navigation'

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Profile'>
}

type Tab = 'biodata' | 'alamat' | 'riwayat' | 'keamanan'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'biodata', label: 'Biodata Diri', icon: 'person-outline' },
  { key: 'alamat', label: 'Alamat Pengiriman', icon: 'location-outline' },
  { key: 'riwayat', label: 'Riwayat Belanja', icon: 'receipt-outline' },
  { key: 'keamanan', label: 'Keamanan', icon: 'lock-closed-outline' },
]

const THEMES: { name: ThemeName; label: string; color: string }[] = [
  { name: 'greenFern', label: 'Green Fern', color: '#388E3C' },
  { name: 'greenJade', label: 'Green Jade', color: '#00796B' },
  { name: 'red', label: 'Merah', color: '#c0392b' },
  { name: 'blue', label: 'Biru', color: '#3b82f6' },
  { name: 'orange', label: 'Orange', color: '#f97316' },
]

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuthStore()
  const t = useTheme()
  const themeName = useThemeName()
  const setTheme = useSetTheme()
  const [activeTab, setActiveTab] = useState<Tab>('biodata')

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
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Alamat Pengiriman</Text>
              <Text style={styles.cardSubtitle}>Coming soon</Text>
            </View>
          )}

          {activeTab === 'riwayat' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Riwayat Belanja</Text>
              <Text style={styles.cardSubtitle}>Coming soon</Text>
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
})
