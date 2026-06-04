const BASE_URL = 'https://foodstore-server-nu.vercel.app'

export function getImageUrl(imageUrl: string): string {
  if (!imageUrl) return ''
  if (imageUrl.startsWith('http')) return imageUrl
  return `${BASE_URL}/upload/${imageUrl}`
}
