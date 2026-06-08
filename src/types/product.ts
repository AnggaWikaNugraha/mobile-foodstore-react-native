export interface ProductCategory {
  _id: string
  name: string
}

export interface Product {
  _id: string
  name: string
  price: number
  image_url: string
  stock: number
  description?: string
  category?: ProductCategory | string
  tags?: string[]
  avg_rating?: number
  review_count?: number
}

export interface Category {
  _id: string
  name: string
}

export interface ProductsResponse {
  data: Product[]
  count: number
}
