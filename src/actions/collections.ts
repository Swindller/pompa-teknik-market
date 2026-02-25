'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { Collection, CollectionFormData } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getCollections(): Promise<Collection[]> {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('getCollections error:', error)
    return []
  }

  return (data as Collection[]) || []
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Collection
}

export async function createCollection(formData: CollectionFormData): Promise<{ error: string | null; data: Collection | null }> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('collections')
    .insert({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      collection_type: formData.collection_type,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Bu slug zaten kullanılıyor.', data: null }
    return { error: error.message, data: null }
  }

  revalidatePath('/admin/collections')
  revalidatePath('/')
  return { error: null, data: data as Collection }
}

export async function updateCollection(id: string, formData: CollectionFormData): Promise<{ error: string | null }> {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('collections')
    .update({
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      collection_type: formData.collection_type,
      sort_order: formData.sort_order,
      is_active: formData.is_active,
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') return { error: 'Bu slug zaten kullanılıyor.' }
    return { error: error.message }
  }

  revalidatePath('/admin/collections')
  revalidatePath('/')
  return { error: null }
}

export async function deleteCollection(id: string): Promise<{ error: string | null }> {
  const supabase = await createAdminClient()

  // Check if it's a default collection
  const { data: col } = await supabase
    .from('collections')
    .select('collection_type')
    .eq('id', id)
    .single()

  if (col && ['yeni_gelenler', 'cok_satanlar', 'indirimdekiler'].includes(col.collection_type)) {
    return { error: 'Varsayılan koleksiyonlar silinemez.' }
  }

  const { error } = await supabase.from('collections').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/collections')
  revalidatePath('/')
  return { error: null }
}

export async function toggleCollectionActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('collections')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/collections')
  revalidatePath('/')
  return { error: null }
}
