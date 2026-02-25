'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { Category, CategoryFormData } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getCategories(): Promise<Category[]> {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('getCategories error:', error)
    return []
  }

  return (data as Category[]) || []
}

export async function getCategoryTree(): Promise<Category[]> {
  const categories = await getCategories()

  // Build tree structure
  const map = new Map<string, Category>()
  const roots: Category[] = []

  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] })
  })

  categories.forEach((cat) => {
    const node = map.get(cat.id)!
    if (cat.parent_id && map.has(cat.parent_id)) {
      const parent = map.get(cat.parent_id)!
      if (!parent.children) parent.children = []
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*, parent:parent_id(*)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Category
}

export async function createCategory(formData: CategoryFormData): Promise<{ error: string | null; data: Category | null }> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      parent_id: formData.parent_id || null,
      main_type: formData.main_type || null,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Bu slug zaten kullanılıyor.', data: null }
    return { error: error.message, data: null }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { error: null, data: data as Category }
}

export async function updateCategory(id: string, formData: CategoryFormData): Promise<{ error: string | null }> {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('categories')
    .update({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      parent_id: formData.parent_id || null,
      main_type: formData.main_type || null,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Bu slug zaten kullanılıyor.' }
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { error: null }
}

export async function deleteCategory(id: string): Promise<{ error: string | null }> {
  const supabase = await createAdminClient()

  // Check if has children
  const { count: childCount } = await supabase
    .from('categories')
    .select('id', { count: 'exact' })
    .eq('parent_id', id)

  if (childCount && childCount > 0) {
    return { error: 'Bu kategorinin alt kategorileri var. Önce alt kategorileri silin.' }
  }

  // Check if has products
  const { count: productCount } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category_id', id)

  if (productCount && productCount > 0) {
    return { error: 'Bu kategoriye ait ürünler var. Önce ürünleri taşıyın veya silin.' }
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { error: null }
}

export async function toggleCategoryActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('categories')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { error: null }
}
