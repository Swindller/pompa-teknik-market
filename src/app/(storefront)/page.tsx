import { getCategories } from '@/actions/categories'
import { getCollections } from '@/actions/collections'
import { getProducts } from '@/actions/products'
import { ProductCard } from '@/components/storefront/ProductCard'
import { ArrowRight, CheckCircle, Layers, Shield, Star, Truck, Wrench } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featuredResult, collections, categories] = await Promise.all([
    getProducts({ is_active: true, page: 1, pageSize: 8 }),
    getCollections(),
    getCategories(),
  ])

  const featuredProducts = featuredResult.data.filter((p) => p.is_featured).slice(0, 8)
  const latestProducts = featuredResult.data.slice(0, 8)
  const activeCollections = collections.filter((c) => c.is_active)
  const rootCategories = categories.filter((c) => !c.parent_id && c.is_active)

  const features = [
    { icon: Truck, title: 'Hızlı Teslimat', description: '2-3 iş gününde kapınızda' },
    { icon: Shield, title: 'Garantili Ürünler', description: 'Orijinal ve belgeli ürünler' },
    { icon: Wrench, title: 'Teknik Destek', description: 'Uzman ekibimiz yanınızda' },
    { icon: CheckCircle, title: 'Kolay İade', description: '14 gün iade garantisi' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 rounded-full px-4 py-1.5 text-sm mb-6">
              <Star className="w-4 h-4" />
              <span>Türkiye'nin Güvenilir Pompa Marketi</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
              Endüstriyel Pompa ve<br />Yedek Parça Çözümleri
            </h1>
            <p className="text-blue-100 text-lg mb-8">
              Santrifüj pompalar, dalgıç pompalar ve tüm yedek parçalar. Hızlı teslimat, orijinal ürünler.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/urunler"
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                Ürünleri Keşfet
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/kategori/pompalar"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                Pompalar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{f.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{f.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {rootCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kategoriler</h2>
              <p className="text-gray-500 mt-1">Aradığınız ürünü kolayca bulun</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rootCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="group bg-white rounded-xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <Layers className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                )}
                <div className="flex items-center gap-1 mt-3 text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  İncele <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Collections */}
      {activeCollections.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Koleksiyonlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeCollections.map((col, i) => {
                const colors = [
                  'from-blue-600 to-blue-700',
                  'from-green-600 to-green-700',
                  'from-orange-500 to-red-600',
                ]
                return (
                  <Link
                    key={col.id}
                    href={`/koleksiyonlar/${col.slug}`}
                    className={`group relative overflow-hidden bg-gradient-to-br ${colors[i % colors.length]} text-white rounded-2xl p-8 hover:shadow-xl transition-all`}
                  >
                    <h3 className="text-xl font-bold mb-2">{col.name}</h3>
                    {col.description && (
                      <p className="text-white/80 text-sm mb-4">{col.description}</p>
                    )}
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-white/90 group-hover:gap-3 transition-all">
                      Hepsine Bak <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Öne Çıkan Ürünler</h2>
              <p className="text-gray-500 mt-1">Seçilmiş özel ürünler</p>
            </div>
            <Link
              href="/urunler"
              className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              Tümünü Gör <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Products */}
      <section className={`${featuredProducts.length > 0 ? 'bg-gray-50' : ''} py-14`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Son Eklenen Ürünler</h2>
              <p className="text-gray-500 mt-1">En yeni ürünlerimiz</p>
            </div>
            <Link
              href="/urunler"
              className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              Tümünü Gör <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {latestProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p>Henüz ürün eklenmedi.</p>
              <Link href="/admin/products/new" className="text-blue-600 hover:underline mt-2 inline-block">
                Admin panelden ürün ekleyin
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
