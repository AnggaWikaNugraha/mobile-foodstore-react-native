import { useEffect, useRef } from 'react'
import { useNetInfo } from '@react-native-community/netinfo'
import { useQueryClient } from '@tanstack/react-query'

export function useOfflineBanner() {
  const { isConnected } = useNetInfo()
  const queryClient = useQueryClient()
  const wasOffline = useRef(false)

  useEffect(() => {
    if (isConnected === false) {
      wasOffline.current = true
    }

    if (isConnected === true && wasOffline.current) {
      wasOffline.current = false
      queryClient.invalidateQueries()
    }
  }, [isConnected])

  return { isConnected }
}
