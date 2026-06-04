export interface CartItem {
  _id: string      // product ID (dari GET response)
  name: string
  image_url: string
  price: number
  qty: number
  checked?: boolean
}

export interface CartPayloadItem {
  _id: string // product_id
  qty: number
}

export type Cart = CartItem[]
