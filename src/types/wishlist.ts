export interface WishlistItem {
  _id: string
  product: {
    _id: string
    name: string
    price: number
    image_url: string
  }
}
