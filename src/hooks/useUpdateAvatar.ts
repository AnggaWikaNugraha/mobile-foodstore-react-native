import { useMutation } from '@tanstack/react-query'
import api from '../lib/axios'

interface UpdateAvatarResult {
  message: string
  image_url: string
}

export function useUpdateAvatar() {
  return useMutation<UpdateAvatarResult, any, string>({
    mutationFn: async (imageUri: string) => {
      const filename = imageUri.split('/').pop() ?? 'avatar.jpg'
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg'
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg'

      const formData = new FormData()
      formData.append('image', { uri: imageUri, name: filename, type: mimeType } as any)

      const res = await api.put('/api/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data as UpdateAvatarResult
    },
  })
}
