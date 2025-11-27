import LoginForm from '@/components/auth/login-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-4 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Sistem Pondok</h1>
          <p className="text-sm text-muted-foreground">Tadzimussunnah</p>
        </div>
        
        <LoginForm />
        
        <div className="text-center">
          <Link href="/register">
            <Button variant="link" size="sm">
              Belum punya akun? Daftar di sini
            </Button>
          </Link>
        </div>
        
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-4">
            <div className="flex gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Sistem Multi-Role</p>
                <p>Jika akun Anda memiliki lebih dari 1 role, Anda akan diminta memilih role setelah login.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
