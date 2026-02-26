'use server'

import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { Product, ProductFormData } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export interface ProductWithRelations extends Product {
  category?: { id: string; name: string; slug: string } | null
  images?: { id: string; url: string; alt_text: string | null; is_primary: boolean; sort_order: number }[]
  features?: { id: string; feature_name: string; feature_value: string; sort_order: number }[]
  collections?: { collection_id: string; collections: { id: string; name: string; slug: string } }[]
}

export async function getProducts(params?: {
  search?: string
  category_id?: string
  is_active?: boolean
  page?: number
  pageSize?: number
}): Promise<{ data: ProductWithRelations[]; count: number }> {
  if (!isSupabaseConfigured()) return { data: [], count: 0 }
  const supabase = await createAdminClient()

  let query = supabase
    .from('products')
    .select(
      `*,
      category:category_id(id, name, slug),
      images:product_images(id, url, alt_text, is_primary, sort_order),
      features:product_features(id, feature_name, feature_value, sort_order)`,
      { count: 'exact' }
    )

  if (params?.search) {
    query = query.or(`name.ilike.%${params.search}%,sku.ilike.%${params.search}%,brand.ilike.%${params.search}%`)
  }
  if (params?.category_id) {
    query = query.eq('category_id', params.category_id)
  }
  if (params?.is_active !== undefined) {
    query = query.eq('is_active', params.is_active)
  }

  const page = params?.page || 1
  const pageSize = params?.pageSize || 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('getProducts error:', error)
    return { data: [], count: 0 }
  }

  return { data: (data as ProductWithRelations[]) || [], count: count || 0 }
}

export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('products')
    .select(
      `*,
      category:category_id(id, name, slug),
      images:product_images(id, url, alt_text, is_primary, sort_order),
      features:product_features(id, feature_name, feature_value, sort_order),
      product_collections(collection_id, collections(id, name, slug))`
    )
    .eq('id', id)
    .single()

  if (error) return null

  return data as ProductWithRelations
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('products')
    .select(
      `*,
      category:category_id(id, name, slug),
      images:product_images(id, url, alt_text, is_primary, sort_order),
      features:product_features(id, feature_name, feature_value, sort_order),
      product_collections(collection_id, collections(id, name, slug))`
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return null

  return data as ProductWithRelations
}

export async function createProduct(
  formData: ProductFormData,
  imageUrls: { url: string; alt_text: string; is_primary: boolean }[]
): Promise<{ error: string | null; data: Product | null }> {
  const supabase = await createAdminClient()

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: formData.name,
      slug: formData.slug,
      short_description: formData.short_description || null,
      description: formData.description || null,
      price: formData.price,
      original_price: formData.original_price || null,
      sku: formData.sku || null,
      stock: formData.stock,
      category_id: formData.category_id || null,
      brand: formData.brand || null,
      model: formData.model || null,
      unit: formData.unit || 'Adet',
      is_active: formData.is_active,
      is_featured: formData.is_featured,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Bu slug zaten kullanılıyor.', data: null }
    return { error: error.message, data: null }
  }

  const productId = product.id

  // Insert features
  if (formData.features && formData.features.length > 0) {
    const validFeatures = formData.features.filter(
      (f) => f.feature_name.trim() && f.feature_value.trim()
    )
    if (validFeatures.length > 0) {
      await supabase.from('product_features').insert(
        validFeatures.map((f, i) => ({
          product_id: productId,
          feature_name: f.feature_name.trim(),
          feature_value: f.feature_value.trim(),
          sort_order: i,
        }))
      )
    }
  }

  // Insert images
  if (imageUrls.length > 0) {
    await supabase.from('product_images').insert(
      imageUrls.map((img, i) => ({
        product_id: productId,
        url: img.url,
        alt_text: img.alt_text || formData.name,
        is_primary: i === 0 || img.is_primary,
        sort_order: i,
      }))
    )
  }

  // Insert collection associations
  if (formData.collection_ids && formData.collection_ids.length > 0) {
    await supabase.from('product_collections').insert(
      formData.collection_ids.map((colId) => ({
        product_id: productId,
        collection_id: colId,
      }))
    )
  }

  revalidatePath('/admin/products')
  revalidatePath('/')
  return { error: null, data: product as Product }
}

export async function updateProduct(
  id: string,
  formData: ProductFormData,
  imageUrls: { url: string; alt_text: string; is_primary: boolean }[]
): Promise<{ error: string | null }> {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('products')
    .update({
      name: formData.name,
      slug: formData.slug,
      short_description: formData.short_description || null,
      description: formData.description || null,
      price: formData.price,
      original_price: formData.original_price || null,
      sku: formData.sku || null,
      stock: formData.stock,
      category_id: formData.category_id || null,
      brand: formData.brand || null,
      model: formData.model || null,
      unit: formData.unit || 'Adet',
      is_active: formData.is_active,
      is_featured: formData.is_featured,
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Bu slug zaten kullanılıyor.' }
    return { error: error.message }
  }

  // Replace features
  await supabase.from('product_features').delete().eq('product_id', id)
  if (formData.features && formData.features.length > 0) {
    const validFeatures = formData.features.filter(
      (f) => f.feature_name.trim() && f.feature_value.trim()
    )
    if (validFeatures.length > 0) {
      await supabase.from('product_features').insert(
        validFeatures.map((f, i) => ({
          product_id: id,
          feature_name: f.feature_name.trim(),
          feature_value: f.feature_value.trim(),
          sort_order: i,
        }))
      )
    }
  }

  // Replace images only if new ones provided
  if (imageUrls.length > 0) {
    await supabase.from('product_images').delete().eq('product_id', id)
    await supabase.from('product_images').insert(
      imageUrls.map((img, i) => ({
        product_id: id,
        url: img.url,
        alt_text: img.alt_text || formData.name,
        is_primary: i === 0 || img.is_primary,
        sort_order: i,
      }))
    )
  }

  // Replace collection associations
  await supabase.from('product_collections').delete().eq('product_id', id)
  if (formData.collection_ids && formData.collection_ids.length > 0) {
    await supabase.from('product_collections').insert(
      formData.collection_ids.map((colId) => ({
        product_id: id,
        collection_id: colId,
      }))
    )
  }

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${id}`)
  revalidatePath('/')
  return { error: null }
}

export async function deleteProduct(id: string): Promise<{ error: string | null }> {
  const supabase = await createAdminClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  revalidatePath('/')
  return { error: null }
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  revalidatePath('/')
  return { error: null }
}

export async function getDashboardStats() {
  if (!isSupabaseConfigured()) {
    return { totalProducts: 0, activeProducts: 0, totalCategories: 0, totalCollections: 0, recentProducts: [], lowStock: [] }
  }
  const supabase = await createAdminClient()

  const [
    { count: totalProducts },
    { count: activeProducts },
    { count: totalCategories },
    { count: totalCollections },
    { data: recentProducts },
    { data: lowStock },
  ] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('categories').select('id', { count: 'exact' }),
    supabase.from('collections').select('id', { count: 'exact' }),
    supabase
      .from('products')
      .select('id, name, price, stock, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('products')
      .select('id, name, stock')
      .lt('stock', 5)
      .eq('is_active', true)
      .order('stock', { ascending: true })
      .limit(5),
  ])

  return {
    totalProducts: totalProducts || 0,
    activeProducts: activeProducts || 0,
    totalCategories: totalCategories || 0,
    totalCollections: totalCollections || 0,
    recentProducts: recentProducts || [],
    lowStock: lowStock || [],
  }
}

export async function uploadProductImage(
  file: FormData
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createAdminClient()
  const imageFile = file.get('file') as File

  if (!imageFile) return { url: null, error: 'Dosya bulunamadı' }

  const fileExt = imageFile.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, imageFile, {
      contentType: imageFile.type,
      upsert: false,
    })

  if (error) return { url: null, error: error.message }

  const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path)
  return { url: urlData.publicUrl, error: null }
}

export async function deleteProductImage(path: string): Promise<{ error: string | null }> {
  const supabase = await createAdminClient()
  const { error } = await supabase.storage.from('product-images').remove([path])
  if (error) return { error: error.message }
  return { error: null }
}
