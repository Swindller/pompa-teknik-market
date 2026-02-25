import { getDashboardStats } from '@/actions/products'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatPrice } from '@/lib/utils'
import { AlertTriangle, Box, FolderTree, Layers, Package, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Toplam Ürün',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      href: '/admin/products',
    },
    {
      title: 'Aktif Ürün',
      value: stats.activeProducts,
      icon: TrendingUp,
      color: 'bg-green-500',
      href: '/admin/products',
    },
    {
      title: 'Kategoriler',
      value: stats.totalCategories,
      icon: FolderTree,
      color: 'bg-purple-500',
      href: '/admin/categories',
    },
    {
      title: 'Koleksiyonlar',
      value: stats.totalCollections,
      icon: Layers,
      color: 'bg-orange-500',
      href: '/admin/collections',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Pompa Teknik Market yönetim paneline hoş geldiniz.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.title}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Package className="w-4 h-4" />
            Yeni Ürün Ekle
          </Link>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            <FolderTree className="w-4 h-4" />
            Kategori Yönet
          </Link>
          <Link
            href="/admin/collections"
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
          >
            <Layers className="w-4 h-4" />
            Koleksiyon Yönet
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Son Eklenen Ürünler</h2>
            <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">
              Tümünü Gör
            </Link>
          </div>
          {stats.recentProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Henüz ürün yok</p>
          ) : (
            <div className="space-y-3">
              {stats.recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xs text-gray-400 mt-0.5">{formatDate(product.created_at)}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 ml-3">{formatPrice(product.price)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h2 className="text-base font-semibold text-gray-900">Düşük Stok Uyarısı</h2>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Stok sorunu yok</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <Badge variant={product.stock === 0 ? 'danger' : 'warning'}>
                    {product.stock} adet
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
