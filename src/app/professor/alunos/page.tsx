'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Avatar } from '@/components/common/Avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Aluno {
  id: string;
  name: string;
  email: string;
  turma: string;
  createdAt: string;
}

export default function AlunosPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turma, setTurma] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAlunos = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        setAlunos(await res.json());
      }
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlunos();
  }, [fetchAlunos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, turma }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `Aluno "${data.name}" cadastrado com sucesso!` });
        setName('');
        setEmail('');
        setPassword('');
        // turma mantém o valor para cadastro em lote da mesma turma
        fetchAlunos();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao cadastrar aluno' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Agrupar alunos por turma
  const turmas = [...new Set(alunos.map((a) => a.turma || 'Sem turma'))].sort();

  return (
    <ProtectedRoute allowedRoles={['professor']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Avatar name={user?.name || ''} size="md" href="/professor/perfil" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Painel do Professor</h1>
                  <p className="text-sm text-gray-500">Bem-vindo, {user?.name}</p>
                </div>
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

        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <a href="/professor" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">Dashboard</a>
              <a href="/professor/questoes" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">Questões</a>
              <a href="/professor/provas" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">Provas</a>
              <a href="/professor/alunos" className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600">Alunos</a>
              <a href="/professor/resultados" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">Resultados</a>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário de cadastro */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Cadastrar Aluno</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nome do aluno"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="aluno@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                    <input
                      id="password"
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Senha inicial"
                    />
                  </div>

                  <div>
                    <label htmlFor="turma" className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                    <input
                      id="turma"
                      type="text"
                      value={turma}
                      onChange={(e) => setTurma(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: DS 2025/1, INFO 3A"
                    />
                  </div>

                  {message && (
                    <div className={`rounded-lg px-4 py-3 text-sm ${
                      message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-600'
                        : 'bg-red-50 border border-red-200 text-red-600'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Cadastrando...' : 'Cadastrar Aluno'}
                  </button>
                </form>
              </div>
            </div>

            {/* Lista de alunos agrupados por turma */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Alunos Cadastrados ({alunos.length})
                  </h2>
                </div>

                {loading ? (
                  <div className="p-6 text-center text-gray-500">Carregando...</div>
                ) : alunos.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p>Nenhum aluno cadastrado</p>
                    <p className="text-sm mt-2">Use o formulário ao lado para cadastrar</p>
                  </div>
                ) : (
                  <div>
                    {turmas.map((turmaName) => {
                      const alunosDaTurma = alunos.filter(
                        (a) => (a.turma || 'Sem turma') === turmaName
                      );
                      return (
                        <div key={turmaName}>
                          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                            <span className="text-sm font-semibold text-gray-600">
                              {turmaName}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              ({alunosDaTurma.length} aluno{alunosDaTurma.length !== 1 ? 's' : ''})
                            </span>
                          </div>
                          <div className="divide-y divide-gray-200">
                            {alunosDaTurma.map((aluno) => (
                              <div key={aluno.id} className="px-6 py-3 flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{aluno.name}</p>
                                  <p className="text-sm text-gray-500">{aluno.email}</p>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {new Date(aluno.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
