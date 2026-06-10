import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { NavigationContainerRef } from '@react-navigation/native'
import { useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import { MainStackParamList } from '../types/navigation'
import useAuthStore from '../store/authStore'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

async function registerFCMToken() {
  if (!Device.isDevice) return

  const { ios } = await Notifications.getPermissionsAsync()
  const isGranted = ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED
    || ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL

  if (!isGranted) {
    const { ios: reqIos } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    })
    const granted = reqIos?.status === Notifications.IosAuthorizationStatus.AUTHORIZED
      || reqIos?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    if (!granted) return
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId })
  await api.put('/api/users/mobile/fcm-token', { fcm_token: token })
}

function navigateToOrder(
  navigationRef: React.RefObject<NavigationContainerRef<MainStackParamList>>,
  orderId: string
) {
  const tryNavigate = () => {
    if (navigationRef.current?.isReady()) {
      navigationRef.current.navigate('Invoice', { orderId })
    } else {
      setTimeout(tryNavigate, 100)
    }
  }
  tryNavigate()
}

export function usePushNotification(
  navigationRef: React.RefObject<NavigationContainerRef<MainStackParamList>>
) {
  const token = useAuthStore(s => s.token)
  const queryClient = useQueryClient()

  // Register FCM token hanya saat user login
  useEffect(() => {
    if (token) registerFCMToken()
  }, [token])

  // Tap notif saat app foreground/background
  useEffect(() => {
    const notifListener = Notifications.addNotificationReceivedListener(notification => {
      const orderId = notification.request.content.data?.order_id as string | undefined
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      }
    })
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const orderId = response.notification.request.content.data?.order_id as string | undefined
      if (orderId) navigateToOrder(navigationRef, orderId)
    })
    return () => {
      notifListener.remove()
      responseListener.remove()
    }
  }, [])

  // App dibuka dari terminated via tap notif
  const lastResponse = Notifications.useLastNotificationResponse()
  useEffect(() => {
    if (!lastResponse) return
    const orderId = lastResponse.notification.request.content.data?.order_id as string | undefined
    if (orderId) navigateToOrder(navigationRef, orderId)
  }, [lastResponse])
}
