// =====================================================
// DATABASE TYPES
// =====================================================

export type MainType = 'pompa' | 'yedek_parca'
export type CollectionType = 'yeni_gelenler' | 'cok_satanlar' | 'indirimdekiler' | 'ozel'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
  main_type: MainType | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations (optional, populated via joins)
  parent?: Category | null
  children?: Category[]
  product_count?: number
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  collection_type: CollectionType
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  product_count?: number
}

export interface Product {
  id: string
  name: string
  slug: string
  short_description: string | null
  description: string | null
  price: number
  original_price: number | null
  sku: string | null
  stock: number
  category_id: string | null
  brand: string | null
  model: string | null
  unit: string
  is_active: boolean
  is_featured: boolean
  view_count: number
  sale_count: number
  created_at: string
  updated_at: string
  // Relations
  category?: Category | null
  features?: ProductFeature[]
  images?: ProductImage[]
  collections?: Collection[]
}

export interface ProductFeature {
  id: string
  product_id: string
  feature_name: string
  feature_value: string
  sort_order: number
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
  created_at: string
}

// =====================================================
// DATABASE GENERIC TYPE (for Supabase client)
// =====================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>
      }
      collections: {
        Row: Collection
        Insert: Omit<Collection, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Collection, 'id' | 'created_at' | 'updated_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'sale_count'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
      }
      product_features: {
        Row: ProductFeature
        Insert: Omit<ProductFeature, 'id' | 'created_at'>
        Update: Partial<Omit<ProductFeature, 'id' | 'created_at'>>
      }
      product_images: {
        Row: ProductImage
        Insert: Omit<ProductImage, 'id' | 'created_at'>
        Update: Partial<Omit<ProductImage, 'id' | 'created_at'>>
      }
      product_collections: {
        Row: { product_id: string; collection_id: string; added_at: string }
        Insert: { product_id: string; collection_id: string }
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// =====================================================
// FORM TYPES
// =====================================================

export interface ProductFormData {
  name: string
  slug: string
  short_description: string
  description: string
  price: number
  original_price: number | null
  sku: string
  stock: number
  category_id: string
  brand: string
  model: string
  unit: string
  is_active: boolean
  is_featured: boolean
  features: { feature_name: string; feature_value: string; sort_order: number }[]
  collection_ids: string[]
}

export interface CategoryFormData {
  name: string
  slug: string
  description: string
  parent_id: string | null
  main_type: MainType | null
  sort_order: number
  is_active: boolean
}

export interface CollectionFormData {
  name: string
  slug: string
  description: string
  collection_type: CollectionType
  sort_order: number
  is_active: boolean
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}
