export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  GoogleAuth: undefined
}

export type MainStackParamList = {
  Home: undefined
  Profile: { initialTab?: 'biodata' | 'alamat' | 'riwayat' | 'keamanan' } | undefined
  Cart: undefined
  Checkout: undefined
  Invoice: { orderId: string; fromCheckout?: boolean }
  Login: undefined
  Register: undefined
  GoogleAuth: undefined
}
