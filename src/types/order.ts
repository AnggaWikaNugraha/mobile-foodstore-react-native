export type OrderStatus =
  | 'waiting_payment'
  | 'payment_confirmed'
  | 'processing'
  | 'in_delivery'
  | 'delivered'
  | 'failed'
  | 'expired'

export interface OrderItem {
  _id: string
  name: string
  qty: number
  price: number
  image_url?: string
}

export interface DeliveryAddressSnapshot {
  nama?: string
  detail?: string
  kelurahan?: string
  kecamatan?: string
  kabupaten?: string
  provinsi?: string
}

export interface Order {
  _id: string
  order_number: number
  status: OrderStatus
  delivery_fee: number
  delivery_address: DeliveryAddressSnapshot
  order_items: OrderItem[]
  createdAt: string
  updatedAt: string
  user: string
}
