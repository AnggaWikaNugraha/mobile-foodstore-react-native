import { useState, useEffect, useRef, useCallback } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'

interface BiometricAuthOptions {
  onLaunch?: boolean
  onBackground?: boolean
}

export function useBiometricAuth({ onLaunch = true, onBackground = false }: BiometricAuthOptions = {}) {
  const [authenticated, setAuthenticated] = useState(!onLaunch)
  const [supported, setSupported] = useState(false)
  const [checking, setChecking] = useState(onLaunch)
  const appState = useRef<AppStateStatus>(AppState.currentState)
  const isAuthenticating = useRef(false)
  const wentToBackground = useRef(false)

  const checkSupport = async (): Promise<boolean> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const isEnrolled = await LocalAuthentication.isEnrolledAsync()
    const ok = hasHardware && isEnrolled
    setSupported(ok)
    return ok
  }

  const authenticate = useCallback(async () => {
    if (isAuthenticating.current) return
    isAuthenticating.current = true
    try {
      const ok = await checkSupport()
      if (!ok) {
        setAuthenticated(true)
        setChecking(false)
        return
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verifikasi identitas Anda',
        fallbackLabel: 'Gunakan PIN',
        cancelLabel: 'Batal',
        disableDeviceFallback: false,
      })
      if (result.success) setAuthenticated(true)
      setChecking(false)
    } finally {
      isAuthenticating.current = false
    }
  }, [])

  useEffect(() => {
    if (!onLaunch) return
    authenticate()
  }, [])

  useEffect(() => {
    if (!onBackground) return

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      appState.current = next

      if (next === 'background') {
        wentToBackground.current = true
      }

      if (wentToBackground.current && next === 'active') {
        wentToBackground.current = false
        setAuthenticated(false)
        setChecking(true)
        authenticate()
      }
    })
    return () => sub.remove()
  }, [onBackground, authenticate])

  return { authenticated, supported, checking, authenticate }
}
