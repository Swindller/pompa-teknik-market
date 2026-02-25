'use client'

import { createCategory, updateCategory } from '@/actions/categories'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Category, CategoryFormData, MainType } from '@/lib/types'
import { slugify } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

interface CategoryFormProps {
  category?: Category | null
  categories: Category[]
  onSuccess?: () => void
}

export function CategoryForm({ category, categories, onSuccess }: CategoryFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      parent_id: category?.parent_id || null,
      main_type: category?.main_type || null,
      sort_order: category?.sort_order || 0,
      is_active: category?.is_active ?? true,
    },
  })

  const nameValue = watch('name')
  const parentIdValue = watch('parent_id')

  // Auto-generate slug from name
  useEffect(() => {
    if (!category) {
      setValue('slug', slugify(nameValue || ''))
    }
  }, [nameValue, category, setValue])

  // Get available parent categories (exclude current and its descendants)
  const getAvailableParents = () => {
    if (!category) return categories
    const excludeIds = new Set<string>()

    const collectDescendants = (id: string) => {
      excludeIds.add(id)
      categories.filter(c => c.parent_id === id).forEach(c => collectDescendants(c.id))
    }
    collectDescendants(category.id)

    return categories.filter(c => !excludeIds.has(c.id))
  }

  const parentOptions = getAvailableParents().map(c => ({
    value: c.id,
    label: c.parent_id
      ? `  └ ${c.name}`
      : c.name,
  }))

  const mainTypeOptions = [
    { value: 'pompa', label: 'Pompa' },
    { value: 'yedek_parca', label: 'Yedek Parça' },
  ]

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true)
    try {
      const formData: CategoryFormData = {
        ...data,
        parent_id: data.parent_id || null,
        main_type: (data.main_type as MainType) || null,
        description: data.description || '',
      }

      let result
      if (category) {
        result = await updateCategory(category.id, formData)
      } else {
        result = await createCategory(formData)
      }

      if (result.error) {
        showToast('error', result.error)
      } else {
        showToast('success', category ? 'Kategori güncellendi.' : 'Kategori oluşturuldu.')
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
        label="Kategori Adı"
        required
        placeholder="örn: Santrifüj Pompalar"
        error={errors.name?.message}
        {...register('name', { required: 'Ad zorunludur' })}
      />

      <Input
        label="Slug (URL)"
        required
        placeholder="örn: santrifuj-pompalar"
        hint="URL'de görünecek kısa ad (otomatik oluşturulur)"
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
        placeholder="Kategori açıklaması (opsiyonel)"
        rows={3}
        {...register('description')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Üst Kategori"
          placeholder="-- Kök Kategori --"
          options={parentOptions}
          {...register('parent_id')}
        />

        <Select
          label="Ana Tür"
          placeholder="-- Seçiniz --"
          options={mainTypeOptions}
          hint="Pompa veya Yedek Parça"
          {...register('main_type')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Sıra"
          type="number"
          min="0"
          defaultValue={0}
          {...register('sort_order', { valueAsNumber: true })}
        />

        <div className="flex items-center gap-3 mt-6">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              {...register('is_active')}
            />
            <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-2 text-sm text-gray-700">Aktif</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {category ? 'Güncelle' : 'Oluştur'}
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
