export interface CartItem {
  _id: string      // product ID (dari GET response)
  name: string
  image_url: string
  price: number
  qty: number
  checked?: boolean
}

export interface CartPayloadItem {
  _id: string
  name: string
  price: number
  image_url: string
  qty: number
  checked: boolean
}

export type Cart = CartItem[]
