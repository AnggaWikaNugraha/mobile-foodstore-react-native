import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'search_history'
const MAX_ITEMS = 8

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setHistory(JSON.parse(raw))
    })
  }, [])

  const addSearch = useCallback((term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setHistory(prev => {
      const next = [trimmed, ...prev.filter(s => s !== trimmed)].slice(0, MAX_ITEMS)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeSearch = useCallback((term: string) => {
    setHistory(prev => {
      const next = prev.filter(s => s !== term)
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearHistory = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  return { history, addSearch, removeSearch, clearHistory }
}
