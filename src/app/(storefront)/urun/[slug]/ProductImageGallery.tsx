'use client'

import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Package, ZoomIn } from 'lucide-react'
import { useState } from 'react'

interface ProductImage {
  id: string
  url: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
}

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
        <div className="text-center">
          <Package className="w-20 h-20 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Resim yok</p>
        </div>
      </div>
    )
  }

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1))

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative group aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
        <img
          src={images[activeIndex].url}
          alt={images[activeIndex].alt_text || productName}
          className="w-full h-full object-contain p-6"
        />

        {/* Zoom button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow hover:bg-white"
          title="Büyüt"
        >
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </button>

        {/* Prev/Next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow hover:bg-white"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i === activeIndex ? 'bg-blue-600 w-4' : 'bg-gray-300 hover:bg-gray-400'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'w-16 h-16 rounded-xl overflow-hidden border-2 transition-all bg-gray-50 shrink-0',
                i === activeIndex
                  ? 'border-blue-500 shadow-sm'
                  : 'border-gray-100 hover:border-blue-300'
              )}
            >
              <img
                src={img.url}
                alt={img.alt_text || productName}
                className="w-full h-full object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[activeIndex].url}
              alt={images[activeIndex].alt_text || productName}
              className="w-full h-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
