'use client'

import { createProduct, updateProduct, uploadProductImage } from '@/actions/products'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Category, Collection, ProductFormData } from '@/lib/types'
import { slugify } from '@/lib/utils'
import { GripVertical, ImagePlus, Plus, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

interface ProductImage {
  url: string
  alt_text: string
  is_primary: boolean
  file?: File
  preview?: string
}

interface ProductFormProps {
  product?: {
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
    images?: { id: string; url: string; alt_text: string | null; is_primary: boolean; sort_order: number }[]
    features?: { id: string; feature_name: string; feature_value: string; sort_order: number }[]
    product_collections?: { collection_id: string }[]
  } | null
  categories: Category[]
  collections: Collection[]
}

export function ProductForm({ product, categories, collections }: ProductFormProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<ProductImage[]>(() => {
    if (product?.images) {
      return product.images
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((img) => ({
          url: img.url,
          alt_text: img.alt_text || '',
          is_primary: img.is_primary,
        }))
    }
    return []
  })
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const existingCollectionIds = product?.product_collections?.map(pc => pc.collection_id) || []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ProductFormData & { collection_ids: string[] }>({
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      short_description: product?.short_description || '',
      description: product?.description || '',
      price: product?.price || 0,
      original_price: product?.original_price || null,
      sku: product?.sku || '',
      stock: product?.stock || 0,
      category_id: product?.category_id || '',
      brand: product?.brand || '',
      model: product?.model || '',
      unit: product?.unit || 'Adet',
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
      features: product?.features
        ? product.features
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((f) => ({ feature_name: f.feature_name, feature_value: f.feature_value, sort_order: f.sort_order }))
        : [],
      collection_ids: existingCollectionIds,
    },
  })

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: 'features',
  })

  const nameValue = watch('name')
  const collectionIds = watch('collection_ids') as string[]

  useEffect(() => {
    if (!product) {
      setValue('slug', slugify(nameValue || ''))
    }
  }, [nameValue, product, setValue])

  // Build flat category options with depth indicator
  const buildCategoryOptions = (cats: Category[], parentId: string | null = null, depth = 0): { value: string; label: string }[] => {
    const result: { value: string; label: string }[] = []
    cats
      .filter((c) => c.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .forEach((cat) => {
        result.push({
          value: cat.id,
          label: depth === 0 ? cat.name : `${'  '.repeat(depth)}└ ${cat.name}`,
        })
        result.push(...buildCategoryOptions(cats, cat.id, depth + 1))
      })
    return result
  }

  const categoryOptions = buildCategoryOptions(categories)

  const unitOptions = [
    { value: 'Adet', label: 'Adet' },
    { value: 'Paket', label: 'Paket' },
    { value: 'Kg', label: 'Kg' },
    { value: 'Lt', label: 'Lt' },
    { value: 'Metre', label: 'Metre' },
    { value: 'Takım', label: 'Takım' },
  ]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setUploadingImages(true)
    const newImages: ProductImage[] = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        showToast('error', `${file.name} geçerli bir resim değil.`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', `${file.name} 5MB'dan büyük olamaz.`)
        continue
      }

      const formData = new FormData()
      formData.append('file', file)

      const { url, error } = await uploadProductImage(formData)
      if (error) {
        showToast('error', `${file.name} yüklenemedi: ${error}`)
        continue
      }

      if (url) {
        newImages.push({
          url,
          alt_text: file.name.replace(/\.[^.]+$/, ''),
          is_primary: images.length === 0 && newImages.length === 0,
        })
      }
    }

    setImages((prev) => [...prev, ...newImages])
    setUploadingImages(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (next.length > 0 && !next.some((img) => img.is_primary)) {
        next[0].is_primary = true
      }
      return next
    })
  }

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === index }))
    )
  }

  const toggleCollection = (colId: string) => {
    const current = collectionIds || []
    if (current.includes(colId)) {
      setValue('collection_ids', current.filter((id) => id !== colId))
    } else {
      setValue('collection_ids', [...current, colId])
    }
  }

  const onSubmit = async (data: ProductFormData & { collection_ids: string[] }) => {
    if (images.length === 0) {
      const confirmNoImage = window.confirm('Resim eklemediniz. Yine de devam etmek istiyor musunuz?')
      if (!confirmNoImage) return
    }

    setLoading(true)
    try {
      const formData: ProductFormData = {
        ...data,
        price: Number(data.price),
        original_price: data.original_price ? Number(data.original_price) : null,
        stock: Number(data.stock),
        category_id: data.category_id || '',
        collection_ids: data.collection_ids || [],
      }

      let result
      if (product) {
        result = await updateProduct(product.id, formData, images)
      } else {
        result = await createProduct(formData, images)
      }

      if (result.error) {
        showToast('error', result.error)
      } else {
        showToast('success', product ? 'Ürün güncellendi.' : 'Ürün oluşturuldu.')
        router.push('/admin/products')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Temel Bilgiler</h2>

        <Input
          label="Ürün Adı"
          required
          placeholder="örn: Grundfos CM3-4 Santrifüj Pompa"
          error={errors.name?.message}
          {...register('name', { required: 'Ürün adı zorunludur' })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Slug (URL)"
            required
            placeholder="örn: grundfos-cm3-4-santrifuj-pompa"
            hint="Otomatik oluşturulur, düzenlenebilir"
            error={errors.slug?.message}
            {...register('slug', {
              required: 'Slug zorunludur',
              pattern: { value: /^[a-z0-9-]+$/, message: 'Sadece küçük harf, rakam ve tire' },
            })}
          />
          <Input
            label="SKU / Stok Kodu"
            placeholder="örn: GF-CM3-4-A"
            {...register('sku')}
          />
        </div>

        <Input
          label="Kısa Açıklama"
          placeholder="Ürün hakkında kısa bir açıklama (ürün kartında görünür)"
          {...register('short_description')}
        />

        <Textarea
          label="Detaylı Açıklama"
          placeholder="Ürünün detaylı açıklaması, kullanım alanları, avantajlar..."
          rows={6}
          {...register('description')}
        />
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Fiyat ve Stok</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="Satış Fiyatı (₺)"
            required
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.price?.message}
            {...register('price', {
              required: 'Fiyat zorunludur',
              min: { value: 0, message: 'Fiyat 0\'dan küçük olamaz' },
            })}
          />
          <Input
            label="Eski Fiyat (₺)"
            type="number"
            step="0.01"
            min="0"
            placeholder="İndirim öncesi fiyat"
            hint="Boş bırakırsanız indirim görünmez"
            {...register('original_price', { setValueAs: (v) => v === '' ? null : Number(v) })}
          />
          <Input
            label="Stok Adedi"
            type="number"
            min="0"
            defaultValue={0}
            {...register('stock', { valueAsNumber: true })}
          />
          <Select
            label="Birim"
            options={unitOptions}
            {...register('unit')}
          />
        </div>
      </div>

      {/* Category & Details */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Kategori ve Marka</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Select
            label="Kategori"
            placeholder="-- Kategori Seçin --"
            options={categoryOptions}
            {...register('category_id')}
          />
          <Input
            label="Marka"
            placeholder="örn: Grundfos, Pedrollo"
            {...register('brand')}
          />
          <Input
            label="Model"
            placeholder="örn: CM3-4 A-R-I-E-AVBV"
            {...register('model')}
          />
        </div>
      </div>

      {/* Collections */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Koleksiyonlar</h2>
        <p className="text-sm text-gray-500">Bu ürünün dahil olacağı koleksiyonları seçin.</p>
        <div className="flex flex-wrap gap-3">
          {collections.map((col) => {
            const isSelected = (collectionIds || []).includes(col.id)
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => toggleCollection(col.id)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {col.name}
              </button>
            )
          })}
          {collections.length === 0 && (
            <p className="text-sm text-gray-400">Henüz koleksiyon yok.</p>
          )}
        </div>
      </div>

      {/* Product Features/Specs */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Ürün Özellikleri / Teknik Veriler</h2>
            <p className="text-sm text-gray-500 mt-0.5">Teknik özellikler, boyutlar, kapasiteler...</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Plus />}
            onClick={() => appendFeature({ feature_name: '', feature_value: '', sort_order: featureFields.length })}
          >
            Özellik Ekle
          </Button>
        </div>

        {featureFields.length === 0 && (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-sm text-gray-400">Henüz özellik eklenmedi.</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => appendFeature({ feature_name: '', feature_value: '', sort_order: 0 })}
            >
              + İlk özelliği ekle
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {featureFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <GripVertical className="w-5 h-5 text-gray-300 mt-2 shrink-0" />
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  placeholder="Özellik adı (örn: Debi)"
                  {...register(`features.${index}.feature_name`)}
                />
                <Input
                  placeholder="Değer (örn: 3 m³/h)"
                  {...register(`features.${index}.feature_value`)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-2 mt-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Ürün Resimleri</h2>
        <p className="text-sm text-gray-500">İlk resim ana resim olarak kullanılır. Max 5MB/resim.</p>

        <div className="flex flex-wrap gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <div
                className={`w-28 h-28 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                  img.is_primary ? 'border-blue-500' : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setPrimaryImage(index)}
              >
                <img
                  src={img.url}
                  alt={img.alt_text || 'Ürün resmi'}
                  className="w-full h-full object-cover"
                />
                {img.is_primary && (
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-600/90 text-white text-[10px] text-center py-0.5">
                    Ana Resim
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImages}
            className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImages ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-400">Resim Ekle</span>
              </>
            )}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Yayın Ayarları</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" {...register('is_active')} />
              <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
              <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">Aktif / Yayında</div>
              <div className="text-xs text-gray-500">Müşteriler bu ürünü görebilir</div>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" {...register('is_featured')} />
              <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-orange-500 transition-colors" />
              <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">Öne Çıkan</div>
              <div className="text-xs text-gray-500">Ana sayfada öne çıkarılır</div>
            </div>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pb-6">
        <Button type="submit" size="lg" loading={loading} className="min-w-[160px]">
          {product ? 'Değişiklikleri Kaydet' : 'Ürünü Oluştur'}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={() => router.push('/admin/products')}
          disabled={loading}
        >
          İptal
        </Button>
      </div>
    </form>
  )
}
