import { getProductBySlug } from '@/actions/products'
import { formatPrice, discountPercent } from '@/lib/utils'
import { AlertCircle, CheckCircle, ChevronRight, Package, Phone, ShoppingBag, Tag, Truck } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductImageGallery } from './ProductImageGallery'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.short_description || product.description?.slice(0, 160),
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) notFound()

  const discount = discountPercent(product.price, product.original_price)
  const sortedImages = (product.images || []).sort((a, b) => a.sort_order - b.sort_order)
  const sortedFeatures = (product.features || []).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-8 flex-wrap">
        <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/urunler" className="hover:text-blue-600">Ürünler</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/kategori/${product.category.slug}`} className="hover:text-blue-600">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <ProductImageGallery images={sortedImages} productName={product.name} />

        {/* Product Info */}
        <div className="space-y-6">
          {product.brand && (
            <div className="text-sm text-blue-600 font-semibold uppercase tracking-wider">
              {product.brand}
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

          {product.model && (
            <div className="text-sm text-gray-500">Model: <span className="font-medium text-gray-700">{product.model}</span></div>
          )}
          {product.sku && (
            <div className="text-sm text-gray-500">SKU: <span className="font-medium text-gray-700">{product.sku}</span></div>
          )}

          {product.short_description && (
            <p className="text-gray-600 leading-relaxed">{product.short_description}</p>
          )}

          {/* Price */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.original_price)}</span>
              )}
              {discount > 0 && (
                <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  %{discount} İndirim
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">KDV Dahil</div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-700 font-medium">
                  Stokta {product.stock > 10 ? 'Mevcut' : `${product.stock} Adet Kaldı`}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-600 font-medium">Stokta Yok</span>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <a
              href="tel:+902121234567"
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors"
            >
              <Phone className="w-5 h-5" />
              Sipariş İçin Arayın
            </a>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="mailto:info@pompateknikimarket.com?subject=Fiyat Talebi"
                className="flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <Tag className="w-4 h-4" />
                Fiyat Al
              </a>
              <a
                href={`https://wa.me/902121234567?text=Merhaba, ${encodeURIComponent(product.name)} ürünü hakkında bilgi almak istiyorum.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="w-4 h-4 text-blue-500" />
              Hızlı Teslimat
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Garantili Ürün
            </div>
          </div>
        </div>
      </div>

      {/* Description & Features */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Description */}
        {product.description && (
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ürün Açıklaması</h2>
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          </div>
        )}

        {/* Features/Specs */}
        {sortedFeatures.length > 0 && (
          <div className={product.description ? '' : 'lg:col-span-3'}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Teknik Özellikler</h2>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {sortedFeatures.map((feature, i) => (
                <div
                  key={feature.id}
                  className={`flex items-start py-3 px-5 ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  } ${i !== 0 ? 'border-t border-gray-50' : ''}`}
                >
                  <span className="text-sm text-gray-500 w-1/2">{feature.feature_name}</span>
                  <span className="text-sm font-semibold text-gray-800 w-1/2">{feature.feature_value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
