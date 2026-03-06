'use client';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Avatar } from '@/components/common/Avatar';
import { ChangeNameForm } from '@/components/common/ChangeNameForm';
import { ChangePasswordForm } from '@/components/common/ChangePasswordForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AlunoPerfilPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <ProtectedRoute allowedRoles={['aluno']}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <a href="/aluno" className="text-sm text-blue-600 hover:text-blue-800">
                  &larr; Voltar ao Painel
                </a>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Perfil */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <Avatar name={user?.name || ''} size="lg" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">{user?.name}</h1>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  Aluno
                </span>
              </div>
            </div>
          </div>

          {/* Alterar Nome */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Alterar Nome</h2>
            {user && <ChangeNameForm currentName={user.name} />}
          </div>

          {/* Alterar Senha */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Alterar Senha</h2>
            <ChangePasswordForm />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
