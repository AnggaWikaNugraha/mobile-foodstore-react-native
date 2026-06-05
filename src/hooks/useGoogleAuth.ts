import { useState } from 'react'
import { Alert, Platform } from 'react-native'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)

  const signInWithGoogle = async () => {
    // Cek apakah native module tersedia (tidak tersedia di Expo Go)
    try {
      require('@react-native-google-signin/google-signin')
    } catch {
      Alert.alert('Info', 'Google Sign-In hanya tersedia di development build')
      return
    }

    if (Platform.OS === 'web') {
      Alert.alert('Info', 'Google Sign-In tidak tersedia di web')
      return
    }

    setIsLoading(true)
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin')

      GoogleSignin.configure({
        webClientId: '637677936843-2d8gqcc84ijgig11tmvn8gh4qk98uiqu.apps.googleusercontent.com',
      })

      await GoogleSignin.hasPlayServices()
      const userInfo = await GoogleSignin.signIn()
      const idToken = userInfo.data?.idToken

      if (!idToken) throw new Error('Tidak dapat id_token dari Google')

      const res = await api.post('/auth/google/mobile', { id_token: idToken })
      await setAuth(res.data.user, res.data.token)
    } catch (error: any) {
      const { statusCodes } = require('@react-native-google-signin/google-signin')
      if (error.code === statusCodes.SIGN_IN_CANCELLED) return
      if (error.code === statusCodes.IN_PROGRESS) return

      const message = error?.response?.data?.message
      if (message === 'email_not_verified') {
        Alert.alert('Email belum diverifikasi', `Silakan verifikasi email ${error?.response?.data?.email}`)
        return
      }
      Alert.alert('Gagal', 'Login Google gagal, coba lagi')
    } finally {
      setIsLoading(false)
    }
  }

  return { signInWithGoogle, isLoading }
}
