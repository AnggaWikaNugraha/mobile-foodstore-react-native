import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useOfflineBanner } from '../hooks/useOfflineBanner'

export default function OfflineBanner() {
  const { isConnected } = useOfflineBanner()
  const translateY = useRef(new Animated.Value(-50)).current

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isConnected === false ? 0 : -50,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [isConnected])

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }] }]}>
      <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
      <Text style={styles.text}>Tidak ada koneksi internet</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    zIndex: 999,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
})
