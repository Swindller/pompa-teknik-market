'use client'

import { cn } from '@/lib/utils'
import {
  BarChart3,
  ChevronDown,
  Cog,
  FolderTree,
  Layers,
  LayoutDashboard,
  Package,
  Store,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'Ürünler',
    href: '/admin/products',
    icon: Package,
  },
  {
    name: 'Kategoriler',
    href: '/admin/categories',
    icon: FolderTree,
  },
  {
    name: 'Koleksiyonlar',
    href: '/admin/collections',
    icon: Layers,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'flex flex-col bg-gray-900 text-white transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700/50">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Cog className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold leading-tight">Pompa Teknik</div>
              <div className="text-xs text-gray-400 leading-tight">Admin Panel</div>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/admin" className="mx-auto">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Cog className="w-5 h-5 text-white" />
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors',
            collapsed && 'hidden'
          )}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700/50">
        <Link
          href="/"
          target="_blank"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Siteyi Görüntüle' : undefined}
        >
          <Store className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Siteyi Görüntüle</span>}
        </Link>
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
            title="Genişlet"
          >
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </button>
        )}
      </div>
    </aside>
  )
}
