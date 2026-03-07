'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

export default function ResultadoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const nota = searchParams.get('nota') || '0';
  const acertos = searchParams.get('acertos') || '0';
  const total = searchParams.get('total') || '0';
  const tentativaId = searchParams.get('tentativaId');
  const notaNum = parseFloat(nota);

  return (
    <ProtectedRoute allowedRoles={['aluno']}>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full text-center">
          {/* Icone */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${notaNum >= 6 ? 'bg-green-100' : 'bg-red-100'}`}>
            {notaNum >= 6 ? (
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Prova Finalizada!</h1>
          <p className="text-gray-500 mb-8">Confira seu resultado abaixo</p>

          {/* Nota */}
          <div className={`text-6xl font-bold mb-2 ${notaNum >= 6 ? 'text-green-600' : 'text-red-600'}`}>
            {nota}
          </div>
          <p className="text-gray-500 text-sm mb-8">Nota (de 0 a 10)</p>

          {/* Detalhes */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600">{acertos}</p>
              <p className="text-xs text-gray-500">Acertos</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-red-600">{parseInt(total) - parseInt(acertos)}</p>
              <p className="text-xs text-gray-500">Erros</p>
            </div>
          </div>

          <div className="space-y-3">
            {tentativaId && (
              <button
                onClick={() => router.push(`/aluno/prova/${tentativaId}/revisao`)}
                className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Revisar Prova
              </button>
            )}
            <button
              onClick={() => router.push('/aluno')}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
