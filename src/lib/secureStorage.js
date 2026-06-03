import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const isWeb = Platform.OS === 'web'

export async function getItem(key) {
  if (isWeb) return localStorage.getItem(key)
  return SecureStore.getItemAsync(key)
}

export async function setItem(key, value) {
  if (isWeb) return localStorage.setItem(key, value)
  return SecureStore.setItemAsync(key, value)
}

export async function deleteItem(key) {
  if (isWeb) return localStorage.removeItem(key)
  return SecureStore.deleteItemAsync(key)
}
