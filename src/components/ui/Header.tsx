import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import useAuthStore from '../../store/authStore'
import { useTheme } from '../../hooks/useTheme'

interface Props {
  onCartPress?: () => void
  onLoginPress?: () => void
  onRegisterPress?: () => void
  onProfilePress?: () => void
}

export default function Header({ onCartPress, onLoginPress, onRegisterPress, onProfilePress }: Props) {
  const { user, token } = useAuthStore()
  const t = useTheme()

  const initials = user?.full_name
    ? user.full_name.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('')
    : '?'

  const firstName = user?.full_name?.split(' ')[0] ?? ''

  return (
    <View style={[styles.container, { backgroundColor: t.primary }]}>
      <View style={styles.logo}>
        <Ionicons name="restaurant" size={20} color={t.white} />
        <Text style={[styles.logoText, { color: t.white }]}>FoodStore</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cartButton} onPress={onCartPress}>
          <Ionicons name="cart-outline" size={22} color={t.white} />
        </TouchableOpacity>

        {token && user ? (
          <TouchableOpacity style={styles.profileContainer} onPress={onProfilePress}>
            <View style={[styles.avatar, { borderColor: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Text style={[styles.avatarText, { color: t.white }]}>{initials}</Text>
            </View>
            <Text style={[styles.userName, { color: t.white }]} numberOfLines={1}>{firstName}</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={[styles.outlineButton, { borderColor: t.white }]} onPress={onLoginPress}>
              <Text style={[styles.outlineButtonText, { color: t.white }]}>Masuk</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.solidButton, { backgroundColor: t.white }]} onPress={onRegisterPress}>
              <Text style={[styles.solidButtonText, { color: t.primary }]}>Daftar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartButton: { padding: 4 },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
  },
  userName: {
    fontWeight: '600',
    fontSize: 14,
    maxWidth: 80,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  outlineButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  solidButton: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  solidButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
})
