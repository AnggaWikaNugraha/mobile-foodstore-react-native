export interface Product {
  _id: string
  name: string
  price: number
  image_url: string
  stock: number
  description?: string
  category?: string
  tags?: string[]
}

export interface Category {
  _id: string
  name: string
}

export interface ProductsResponse {
  data: Product[]
  count: number
}
