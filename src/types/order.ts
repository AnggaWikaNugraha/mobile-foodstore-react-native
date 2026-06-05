export interface OrderItem {
  name: string
  qty: number
  price: number
}

export interface Order {
  _id: string
  order_number: number
  status: string
  delivery_fee: number
  delivery_address: string
  order_items: OrderItem[]
  createdAt: string
}
