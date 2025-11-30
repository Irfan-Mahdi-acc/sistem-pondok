import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Penerimaan Santri Baru",
  description: "Portal Penerimaan Santri Baru Pondok Pesantren Tadzimussunnah",
}

export default function PublicPSBLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo placeholder if needed */}
            <span className="text-xl font-bold text-gray-900 dark:text-white">PSB Tadzimussunnah</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="/psb" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white font-medium transition-colors">Beranda</a>
            <a href="/psb/check" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white font-medium transition-colors">Cek Status</a>
            <a href="/login" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white font-medium transition-colors">Login Admin</a>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-800 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Pondok Pesantren Tadzimussunnah. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
