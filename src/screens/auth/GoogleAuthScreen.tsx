import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { WebView, WebViewNavigation } from 'react-native-webview'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useAuthStore from '../../store/authStore'
import api from '../../lib/axios'
import { AuthStackParamList } from '../../types/navigation'

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'GoogleAuth'>
}

const GOOGLE_AUTH_URL = 'https://foodstore-server-nu.vercel.app/auth/google'

export default function GoogleAuthScreen({ navigation }: Props) {
  const setAuth = useAuthStore((state) => state.setAuth)

  const handleNavigationChange = async (navState: WebViewNavigation) => {
    const { url } = navState

    if (!url.includes('auth/callback')) return

    const tokenMatch = url.match(/token=([^&]+)/)
    if (!tokenMatch) return

    const token = tokenMatch[1]

    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      await setAuth(res.data, token)
    } catch {
      navigation.goBack()
    }
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: GOOGLE_AUTH_URL }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
