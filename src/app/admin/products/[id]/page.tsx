import { getProductById } from '@/actions/products'
import { getCategories } from '@/actions/categories'
import { getCollections } from '@/actions/collections'
import { ProductForm } from '@/components/admin/ProductForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, categories, collections] = await Promise.all([
    getProductById(id),
    getCategories(),
    getCollections(),
  ])

  if (!product) notFound()

  // Shape product data for ProductForm
  const productForForm = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    short_description: product.short_description,
    description: product.description,
    price: product.price,
    original_price: product.original_price,
    sku: product.sku,
    stock: product.stock,
    category_id: product.category_id,
    brand: product.brand,
    model: product.model,
    unit: product.unit,
    is_active: product.is_active,
    is_featured: product.is_featured,
    images: product.images,
    features: product.features,
    product_collections: (product as any).product_collections || [],
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Ürün Düzenle</h1>
          <p className="text-gray-500 mt-0.5 line-clamp-1">{product.name}</p>
        </div>
      </div>

      <ProductForm
        product={productForForm}
        categories={categories}
        collections={collections.filter((c) => c.is_active)}
      />
    </div>
  )
}
