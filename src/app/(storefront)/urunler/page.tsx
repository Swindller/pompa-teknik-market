import { getCategories } from '@/actions/categories'
import { getProducts } from '@/actions/products'
import { ProductCard } from '@/components/storefront/ProductCard'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tüm Ürünler',
}

export const dynamic = 'force-dynamic'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string; sort?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1

  const [{ data: products, count }, categories] = await Promise.all([
    getProducts({
      search: params.search,
      category_id: params.category,
      is_active: true,
      page,
      pageSize: 16,
    }),
    getCategories(),
  ])

  const totalPages = Math.ceil(count / 16)
  const activeCategories = categories.filter((c) => c.is_active)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Ana Sayfa</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Tüm Ürünler</span>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Search */}
            <div>
              <form method="GET">
                <input
                  type="text"
                  name="search"
                  defaultValue={params.search}
                  placeholder="Ürün ara..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </form>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Kategoriler</h3>
              <div className="space-y-1">
                <Link
                  href="/urunler"
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    !params.category
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Tüm Ürünler
                </Link>
                {activeCategories
                  .filter((c) => !c.parent_id)
                  .map((cat) => (
                    <div key={cat.id}>
                      <Link
                        href={`/urunler?category=${cat.id}`}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          params.category === cat.id
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {cat.name}
                      </Link>
                      {/* Subcategories */}
                      {activeCategories
                        .filter((sc) => sc.parent_id === cat.id)
                        .map((subcat) => (
                          <Link
                            key={subcat.id}
                            href={`/urunler?category=${subcat.id}`}
                            className={`block pl-6 pr-3 py-1.5 rounded-lg text-sm transition-colors ${
                              params.category === subcat.id
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            └ {subcat.name}
                          </Link>
                        ))}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">
              {params.search ? `"${params.search}" sonuçları` : 'Tüm Ürünler'}
              <span className="text-sm font-normal text-gray-500 ml-2">({count} ürün)</span>
            </h1>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-4">Ürün bulunamadı</p>
              <Link href="/urunler" className="text-blue-600 hover:underline">
                Tüm ürünleri görüntüle
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/urunler?${new URLSearchParams({
                        ...(params.search ? { search: params.search } : {}),
                        ...(params.category ? { category: params.category } : {}),
                        page: String(p),
                      })}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
