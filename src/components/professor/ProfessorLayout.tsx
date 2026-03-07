'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Avatar } from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/professor', label: 'Dashboard', exact: true },
  { href: '/professor/questoes', label: 'Questões' },
  { href: '/professor/provas', label: 'Provas' },
  { href: '/professor/alunos', label: 'Alunos' },
  { href: '/professor/resultados', label: 'Resultados' },
];

interface ProfessorLayoutProps {
  children: React.ReactNode;
  titulo?: string;
  subtitulo?: string;
}

export function ProfessorLayout({ children, titulo, subtitulo }: ProfessorLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <ProtectedRoute allowedRoles={['professor', 'admin']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Avatar name={user?.name || ''} size="md" href="/professor/perfil" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {titulo || 'Painel do Professor'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {subtitulo || `Bem-vindo, ${user?.name}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                    isActive(item)
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              {user?.role === 'admin' && (
                <a
                  href="/professor/admin"
                  className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                    pathname.startsWith('/professor/admin')
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-orange-500 hover:text-orange-700 hover:border-orange-300'
                  }`}
                >
                  Admin
                </a>
              )}
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
