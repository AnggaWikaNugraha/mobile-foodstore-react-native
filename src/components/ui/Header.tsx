import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import useAuthStore from '../../store/authStore'

interface Props {
  onCartPress?: () => void
  onLoginPress?: () => void
  onRegisterPress?: () => void
}

export default function Header({ onCartPress, onLoginPress, onRegisterPress }: Props) {
  const { user, token } = useAuthStore()

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="restaurant" size={20} color="#fff" />
        <Text style={styles.logoText}>FoodStore</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cartButton} onPress={onCartPress}>
          <Ionicons name="cart-outline" size={22} color="#fff" />
        </TouchableOpacity>

        {token ? (
          <Text style={styles.userName} numberOfLines={1}>{user?.full_name?.split(' ')[0]}</Text>
        ) : (
          <>
            <TouchableOpacity style={styles.outlineButton} onPress={onLoginPress}>
              <Text style={styles.outlineButtonText}>Masuk</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.solidButton} onPress={onRegisterPress}>
              <Text style={styles.solidButtonText}>Daftar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#c0392b',
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
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartButton: {
    padding: 4,
  },
  outlineButton: {
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  outlineButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  solidButton: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  solidButtonText: {
    color: '#c0392b',
    fontSize: 13,
    fontWeight: '700',
  },
  userName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
})
