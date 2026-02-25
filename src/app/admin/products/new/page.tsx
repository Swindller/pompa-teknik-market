import { getCategories } from '@/actions/categories'
import { getCollections } from '@/actions/collections'
import { ProductForm } from '@/components/admin/ProductForm'
import { ToastProvider } from '@/components/ui/Toast'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([
    getCategories(),
    getCollections(),
  ])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
          <p className="text-gray-500 mt-0.5">Ürün bilgilerini doldurun ve kaydedin.</p>
        </div>
      </div>

      <ProductForm
        categories={categories}
        collections={collections.filter((c) => c.is_active)}
      />
    </div>
  )
}
