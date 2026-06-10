import React, { useEffect, useRef } from 'react'
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { View, ActivityIndicator } from 'react-native'

import useAuthStore from './src/store/authStore'
import { useBiometricAuth } from './src/hooks/useBiometricAuth'
import { usePushNotification } from './src/hooks/usePushNotification'
import OfflineBanner from './src/components/OfflineBanner'
import LockScreen from './src/screens/auth/LockScreen'
import { MainStackParamList } from './src/types/navigation'
import LoginScreen from './src/screens/auth/LoginScreen'
import RegisterScreen from './src/screens/auth/RegisterScreen'
import GoogleAuthScreen from './src/screens/auth/GoogleAuthScreen'
import HomeScreen from './src/screens/main/HomeScreen'
import ProfileScreen from './src/screens/main/ProfileScreen'
import CartScreen from './src/screens/main/CartScreen'
import CheckoutScreen from './src/screens/main/CheckoutScreen'
import InvoiceScreen from './src/screens/main/InvoiceScreen'
import ProductDetailScreen from './src/screens/main/ProductDetailScreen'

const Stack = createNativeStackNavigator<MainStackParamList>()
const queryClient = new QueryClient()

function RootNavigator() {
  const { isLoading, loadAuth } = useAuthStore()

  useEffect(() => {
    loadAuth()
  }, [])

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="GoogleAuth" component={GoogleAuthScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Invoice" component={InvoiceScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  )
}

function BiometricGate({ children }: { children: React.ReactNode }) {
  const { authenticated, supported, checking, authenticate } = useBiometricAuth({ onBackground : false, onLaunch: false})

  if (supported && !authenticated) {
    return <LockScreen onRetry={authenticate} checking={checking} />
  }

  return <>{children}</>
}

function AppContent() {
  const navigationRef = useRef<NavigationContainerRef<MainStackParamList>>(null)
  usePushNotification(navigationRef)

  return (
    <BiometricGate>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
      <OfflineBanner />
    </BiometricGate>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}
