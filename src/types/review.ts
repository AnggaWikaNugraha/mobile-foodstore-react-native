export interface Review {
  _id: string
  product_id?: string
  order_id?: string
  user: { _id: string; full_name: string } | string
  rating: number
  comment: string
  createdAt: string
}

export interface CreateReviewPayload {
  product_id: string
  order_id: string
  rating: number
  comment: string
}
