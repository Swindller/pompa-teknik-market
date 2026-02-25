'use client'

import { createCollection, updateCollection } from '@/actions/collections'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Collection, CollectionFormData, CollectionType } from '@/lib/types'
import { slugify } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

interface CollectionFormProps {
  collection?: Collection | null
  onSuccess?: () => void
}

const COLLECTION_TYPE_OPTIONS = [
  { value: 'yeni_gelenler', label: 'Yeni Gelenler' },
  { value: 'cok_satanlar', label: 'Çok Satanlar' },
  { value: 'indirimdekiler', label: 'İndirimdekiler' },
  { value: 'ozel', label: 'Özel Koleksiyon' },
]

export function CollectionForm({ collection, onSuccess }: CollectionFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CollectionFormData>({
    defaultValues: {
      name: collection?.name || '',
      slug: collection?.slug || '',
      description: collection?.description || '',
      collection_type: collection?.collection_type || 'ozel',
      sort_order: collection?.sort_order || 0,
      is_active: collection?.is_active ?? true,
    },
  })

  const nameValue = watch('name')

  useEffect(() => {
    if (!collection) {
      setValue('slug', slugify(nameValue || ''))
    }
  }, [nameValue, collection, setValue])

  const onSubmit = async (data: CollectionFormData) => {
    setLoading(true)
    try {
      let result
      if (collection) {
        result = await updateCollection(collection.id, data)
      } else {
        result = await createCollection(data)
      }

      if (result.error) {
        showToast('error', result.error)
      } else {
        showToast('success', collection ? 'Koleksiyon güncellendi.' : 'Koleksiyon oluşturuldu.')
        onSuccess?.()
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Koleksiyon Adı"
        required
        placeholder="örn: Sezon İndirimleri"
        error={errors.name?.message}
        {...register('name', { required: 'Ad zorunludur' })}
      />

      <Input
        label="Slug (URL)"
        required
        placeholder="örn: sezon-indirimleri"
        error={errors.slug?.message}
        {...register('slug', {
          required: 'Slug zorunludur',
          pattern: {
            value: /^[a-z0-9-]+$/,
            message: 'Sadece küçük harf, rakam ve tire kullanılabilir',
          },
        })}
      />

      <Textarea
        label="Açıklama"
        placeholder="Koleksiyon açıklaması (opsiyonel)"
        rows={3}
        {...register('description')}
      />

      <Select
        label="Koleksiyon Türü"
        required
        options={COLLECTION_TYPE_OPTIONS}
        error={errors.collection_type?.message}
        {...register('collection_type', { required: 'Tür zorunludur' })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Sıra"
          type="number"
          min="0"
          {...register('sort_order', { valueAsNumber: true })}
        />

        <div className="flex items-center gap-3 mt-6">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" {...register('is_active')} />
            <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-2 text-sm text-gray-700">Aktif</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {collection ? 'Güncelle' : 'Oluştur'}
        </Button>
        {onSuccess && (
          <Button type="button" variant="outline" onClick={onSuccess}>
            İptal
          </Button>
        )}
      </div>
    </form>
  )
}
