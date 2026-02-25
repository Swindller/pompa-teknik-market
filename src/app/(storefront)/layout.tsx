import { Footer } from '@/components/storefront/Footer'
import { Header } from '@/components/storefront/Header'
import { ToastProvider } from '@/components/ui/Toast'

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ToastProvider>
  )
}
