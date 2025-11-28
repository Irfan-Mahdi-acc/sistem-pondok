import LoginForm from '@/components/auth/login-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { Info } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      {/* Left Banner */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-600 opacity-90" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Sistem Pondok Tadzimussunnah
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Menuntut ilmu adalah kewajiban bagi setiap muslim.&rdquo;
            </p>
            <footer className="text-sm">HR. Ibnu Majah</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex flex-col h-full">
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Selamat Datang Kembali
              </h1>
              <p className="text-sm text-muted-foreground">
                Masukkan kredensial Anda untuk mengakses sistem
              </p>
            </div>
            
            <LoginForm />
            
            <div className="px-8 text-center text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg border border-muted">
                <Info className="h-4 w-4 text-primary" />
                <span className="text-xs">
                  Mendukung Multi-Role Login
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
