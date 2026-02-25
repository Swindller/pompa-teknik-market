import { Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <div className="font-bold text-white leading-tight">Pompa Teknik</div>
                <div className="text-xs text-gray-400 leading-tight">Market</div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Endüstriyel pompa ve yedek parça çözümlerinde güvenilir adresiniz.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kategoriler</h3>
            <ul className="space-y-2">
              {[
                { label: 'Pompalar', href: '/kategori/pompalar' },
                { label: 'Yedek Parçalar', href: '/kategori/yedek-parcalar' },
                { label: 'Yeni Gelenler', href: '/koleksiyonlar/yeni-gelenler' },
                { label: 'Çok Satanlar', href: '/koleksiyonlar/cok-satanlar' },
                { label: 'İndirimler', href: '/koleksiyonlar/indirimdekiler' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-2">
              {[
                { label: 'Tüm Ürünler', href: '/urunler' },
                { label: 'Hakkımızda', href: '/hakkimizda' },
                { label: 'İletişim', href: '/iletisim' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <a href="tel:+902121234567" className="text-sm hover:text-white transition-colors">
                  +90 212 123 45 67
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <a href="mailto:info@pompateknikimarket.com" className="text-sm hover:text-white transition-colors">
                  info@pompateknikimarket.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <span className="text-sm">İstanbul, Türkiye</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Pompa Teknik Market. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  )
}
