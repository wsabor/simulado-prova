'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // admin tem acesso a tudo que professor tem
  const hasAccess =
    user && (allowedRoles.includes(user.role) || (user.role === 'admin' && allowedRoles.includes('professor')));

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!hasAccess) {
        if (user.role === 'admin' || user.role === 'professor') {
          router.push('/professor');
        } else {
          router.push('/aluno');
        }
      }
    }
  }, [user, loading, hasAccess, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-xl">Carregando...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
