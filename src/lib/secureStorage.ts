import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const isWeb = Platform.OS === 'web'

export async function getItem(key: string): Promise<string | null> {
  if (isWeb) return localStorage.getItem(key)
  return SecureStore.getItemAsync(key)
}

export async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) return localStorage.setItem(key, value)
  return SecureStore.setItemAsync(key, value)
}

export async function deleteItem(key: string): Promise<void> {
  if (isWeb) return localStorage.removeItem(key)
  return SecureStore.deleteItemAsync(key)
}
