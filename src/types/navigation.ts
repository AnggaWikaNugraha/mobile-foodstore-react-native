export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  GoogleAuth: undefined
}

export type MainStackParamList = {
  Home: undefined
  Profile: { initialTab?: 'biodata' | 'alamat' | 'riwayat' | 'wishlist' | 'keamanan' } | undefined
  Cart: undefined
  Checkout: undefined
  Invoice: { orderId: string; fromCheckout?: boolean }
  ProductDetail: { productId: string; name: string }
  Login: undefined
  Register: undefined
  GoogleAuth: undefined
}
