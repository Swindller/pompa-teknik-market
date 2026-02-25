'use client'

import { deleteProduct, toggleProductActive } from '@/actions/products'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Category } from '@/lib/types'
import { formatPrice, formatShortDate, getPrimaryImage } from '@/lib/utils'
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface ProductItem {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  stock: number
  sku: string | null
  brand: string | null
  is_active: boolean
  is_featured: boolean
  created_at: string
  category?: { id: string; name: string; slug: string } | null
  images?: { url: string; is_primary: boolean }[]
}

interface ProductsClientProps {
  products: ProductItem[]
  categories: Category[]
  total: number
  page: number
  pageSize: number
  search?: string
  categoryFilter?: string
}

export function ProductsClient({
  products,
  categories,
  total,
  page,
  pageSize,
  search,
  categoryFilter,
}: ProductsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState(search || '')

  const totalPages = Math.ceil(total / pageSize)

  const updateSearch = (params: Record<string, string | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        current.set(key, value)
      } else {
        current.delete(key)
      }
    })
    current.delete('page')
    router.push(`/admin/products?${current.toString()}`)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const result = await deleteProduct(deleteTarget.id)
    setDeleteLoading(false)
    if (result.error) {
      showToast('error', result.error)
    } else {
      showToast('success', 'Ürün silindi.')
      setDeleteTarget(null)
      router.refresh()
    }
  }

  const handleToggleActive = async (product: ProductItem) => {
    setToggling(product.id)
    const result = await toggleProductActive(product.id, !product.is_active)
    setToggling(null)
    if (result.error) {
      showToast('error', result.error)
    } else {
      router.refresh()
    }
  }

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-gray-500 mt-1">{total} ürün</p>
        </div>
        <Link href="/admin/products/new">
          <Button leftIcon={<Plus />}>Yeni Ürün</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateSearch({ search: searchValue || undefined })
              }
            }}
            placeholder="Ürün adı, SKU veya marka ara..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoryFilter || ''}
          onChange={(e) => updateSearch({ category_id: e.target.value || undefined })}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
        >
          <option value="">Tüm Kategoriler</option>
          {categoryOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {(search || categoryFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchValue('')
              router.push('/admin/products')
            }}
          >
            Filtreleri Temizle
          </Button>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              {search ? 'Arama sonucu bulunamadı' : 'Henüz ürün yok'}
            </p>
            <Link href="/admin/products/new">
              <Button className="mt-4" leftIcon={<Plus />}>Yeni Ürün Ekle</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => {
                    const primaryImage = getPrimaryImage(product.images || [])
                    return (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              {primaryImage ? (
                                <img
                                  src={primaryImage}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/admin/products/${product.id}`}
                                className="text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-1"
                              >
                                {product.name}
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5">
                                {product.sku && (
                                  <span className="text-xs text-gray-400">SKU: {product.sku}</span>
                                )}
                                {product.brand && (
                                  <span className="text-xs text-gray-400">{product.brand}</span>
                                )}
                                {product.is_featured && (
                                  <Badge variant="warning" size="sm">Öne Çıkan</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {product.category ? (
                            <Badge variant="neutral">{product.category.name}</Badge>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</div>
                            {product.original_price && product.original_price > product.price && (
                              <div className="text-xs text-gray-400 line-through">
                                {formatPrice(product.original_price)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              product.stock === 0 ? 'danger' : product.stock < 5 ? 'warning' : 'success'
                            }
                          >
                            {product.stock}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleActive(product)}
                            disabled={toggling === product.id}
                            className="relative inline-flex items-center cursor-pointer"
                          >
                            <div
                              className={`w-10 h-6 rounded-full transition-colors ${
                                product.is_active ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <div
                                className={`absolute top-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                  product.is_active ? 'translate-x-[18px]' : 'translate-x-[2px]'
                                }`}
                              />
                            </div>
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {formatShortDate(product.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <div className="text-sm text-gray-500">
                  {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total} ürün
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => router.push(`/admin/products?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page - 1) })}`)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => router.push(`/admin/products?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page + 1) })}`)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Ürünü Sil"
        message={`"${deleteTarget?.name}" ürününü silmek istediğinize emin misiniz? Tüm resimler ve veriler silinecek.`}
      />
    </div>
  )
}
