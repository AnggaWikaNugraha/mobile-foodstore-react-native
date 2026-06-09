import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Props {
  onRetry: () => void
  checking: boolean
}

export default function LockScreen({ onRetry, checking }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <View style={styles.iconWrapper}>
          <Ionicons name="restaurant" size={40} color="#fff" />
        </View>
        <Text style={styles.appName}>FoodStore</Text>
        <Text style={styles.subtitle}>Verifikasi identitas Anda untuk melanjutkan</Text>

        {checking ? (
          <ActivityIndicator size="large" color="#fff" style={styles.indicator} />
        ) : (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Ionicons name="finger-print-outline" size={22} color="#1a1a1a" />
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  indicator: { marginTop: 8 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  retryText: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
})
