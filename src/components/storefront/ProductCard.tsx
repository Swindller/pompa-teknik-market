import { discountPercent, formatPrice, getPrimaryImage } from '@/lib/utils'
import { Package } from 'lucide-react'
import Link from 'next/link'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    short_description?: string | null
    price: number
    original_price?: number | null
    stock: number
    brand?: string | null
    images?: { url: string; is_primary: boolean }[]
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = getPrimaryImage(product.images || [])
  const discount = discountPercent(product.price, product.original_price || null)
  const isOutOfStock = product.stock === 0

  return (
    <Link
      href={`/urun/${product.slug}`}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-200" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Tükendi
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {product.brand && (
          <div className="text-xs text-blue-600 font-medium mb-1">{product.brand}</div>
        )}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.short_description}</p>
        )}

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.original_price)}</span>
          )}
        </div>

        {/* Stock */}
        {product.stock > 0 && product.stock <= 10 && (
          <div className="mt-2 text-xs text-orange-600 font-medium">
            Son {product.stock} ürün!
          </div>
        )}
      </div>
    </Link>
  )
}
