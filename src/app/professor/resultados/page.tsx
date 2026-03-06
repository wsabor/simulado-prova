'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Resultado {
  tentativaId: string;
  provaId: string;
  provaTitulo: string;
  provaMaterias: string[];
  provaSemestres: number[];
  alunoId: string;
  alunoNome: string;
  alunoEmail: string;
  alunoTurma: string;
  nota: number | null;
  totalQuestoes: number;
  finalizada: string;
}

interface Stats {
  totalTentativas: number;
  mediaGeral: number;
  maiorNota: number;
  menorNota: number;
  aprovados: number;
  reprovados: number;
}

interface MediaProva {
  provaTitulo: string;
  media: number;
  count: number;
}

interface Filtros {
  turmas: string[];
  provas: { id: string; titulo: string }[];
  materias: string[];
  semestres: number[];
}

interface ApiResponse {
  resultados: Resultado[];
  stats: Stats;
  distribuicao: number[];
  mediasPorProva: MediaProva[];
  filtros: Filtros;
}

export default function ResultadosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [turma, setTurma] = useState('');
  const [provaId, setProvaId] = useState('');
  const [materia, setMateria] = useState('');
  const [semestre, setSemestre] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (turma) params.set('turma', turma);
      if (provaId) params.set('provaId', provaId);
      if (materia) params.set('materia', materia);
      if (semestre) params.set('semestre', semestre);

      const res = await fetch(`/api/professor/resultados?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar resultados');
      const json: ApiResponse = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  }, [turma, provaId, materia, semestre]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const maxDistribuicao = data ? Math.max(...data.distribuicao, 1) : 1;

  return (
    <ProtectedRoute allowedRoles={['professor', 'admin']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Resultados</h1>
                <p className="text-sm text-gray-500">Estatísticas e desempenho dos alunos</p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                <select
                  value={turma}
                  onChange={(e) => setTurma(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas as turmas</option>
                  {data?.filtros.turmas.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prova</label>
                <select
                  value={provaId}
                  onChange={(e) => setProvaId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas as provas</option>
                  {data?.filtros.provas.map((p) => (
                    <option key={p.id} value={p.id}>{p.titulo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
                <select
                  value={materia}
                  onChange={(e) => setMateria(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas as matérias</option>
                  {data?.filtros.materias.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
                <select
                  value={semestre}
                  onChange={(e) => setSemestre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos os semestres</option>
                  {data?.filtros.semestres.map((s) => (
                    <option key={s} value={s}>{s}° Semestre</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Carregando resultados...</p>
            </div>
          ) : !data || data.resultados.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg font-medium">Nenhum resultado encontrado</p>
              <p className="text-sm mt-2">Nenhum aluno realizou provas com os filtros selecionados</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <StatCard label="Total de Provas" value={data.stats.totalTentativas} color="blue" />
                <StatCard label="Média Geral" value={data.stats.mediaGeral} color="purple" />
                <StatCard label="Maior Nota" value={data.stats.maiorNota} color="green" />
                <StatCard label="Menor Nota" value={data.stats.menorNota} color="red" />
                <StatCard label="Aprovados" value={data.stats.aprovados} color="green" suffix={` (${data.stats.totalTentativas > 0 ? Math.round((data.stats.aprovados / data.stats.totalTentativas) * 100) : 0}%)`} />
                <StatCard label="Reprovados" value={data.stats.reprovados} color="red" suffix={` (${data.stats.totalTentativas > 0 ? Math.round((data.stats.reprovados / data.stats.totalTentativas) * 100) : 0}%)`} />
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Distribuição de Notas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Distribuição de Notas</h3>
                  <div className="flex items-end gap-2 h-48">
                    {data.distribuicao.map((count, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500 font-medium">
                          {count > 0 ? count : ''}
                        </span>
                        <div
                          className={`w-full rounded-t transition-all ${idx < 6 ? 'bg-red-400' : 'bg-green-400'}`}
                          style={{ height: `${(count / maxDistribuicao) * 100}%`, minHeight: count > 0 ? '4px' : '0px' }}
                        />
                        <span className="text-xs text-gray-600 font-medium">{idx}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-red-500">Reprovado</span>
                    <span className="text-xs text-green-500">Aprovado</span>
                  </div>
                </div>

                {/* Média por Prova */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">Média por Prova</h3>
                  {data.mediasPorProva.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Sem dados</p>
                  ) : (
                    <div className="space-y-4">
                      {data.mediasPorProva.map((mp, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700 truncate mr-2">{mp.provaTitulo}</span>
                            <span className={`font-bold ${mp.media >= 6 ? 'text-green-600' : 'text-red-600'}`}>
                              {mp.media} <span className="text-gray-400 font-normal text-xs">({mp.count} alunos)</span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${mp.media >= 6 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${(mp.media / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Aprovados vs Reprovados - Barra visual */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Taxa de Aprovação</h3>
                <div className="flex rounded-full h-8 overflow-hidden bg-gray-100">
                  {data.stats.aprovados > 0 && (
                    <div
                      className="bg-green-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                      style={{ width: `${(data.stats.aprovados / data.stats.totalTentativas) * 100}%` }}
                    >
                      {Math.round((data.stats.aprovados / data.stats.totalTentativas) * 100)}%
                    </div>
                  )}
                  {data.stats.reprovados > 0 && (
                    <div
                      className="bg-red-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                      style={{ width: `${(data.stats.reprovados / data.stats.totalTentativas) * 100}%` }}
                    >
                      {Math.round((data.stats.reprovados / data.stats.totalTentativas) * 100)}%
                    </div>
                  )}
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-green-600 font-medium">Aprovados: {data.stats.aprovados}</span>
                  <span className="text-red-600 font-medium">Reprovados: {data.stats.reprovados}</span>
                </div>
              </div>

              {/* Tabela de Resultados */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Histórico de Resultados ({data.resultados.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Aluno</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Turma</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Prova</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Matérias</th>
                        <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Questões</th>
                        <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Nota</th>
                        <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.resultados.map((r) => (
                        <tr key={r.tentativaId} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{r.alunoNome}</div>
                            <div className="text-xs text-gray-500">{r.alunoEmail}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{r.alunoTurma}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.provaTitulo}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{r.provaMaterias.join(', ')}</td>
                          <td className="px-6 py-4 text-sm text-center text-gray-600">{r.totalQuestoes}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-lg font-bold ${(r.nota ?? 0) >= 6 ? 'text-green-600' : 'text-red-600'}`}>
                              {r.nota !== null ? r.nota : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                              (r.nota ?? 0) >= 6
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {(r.nota ?? 0) >= 6 ? 'Aprovado' : 'Reprovado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(r.finalizada).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ label, value, color, suffix = '' }: { label: string; value: number; color: string; suffix?: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold">
        <span className={colorClasses[color]?.split(' ')[1] || 'text-gray-900'}>{value}</span>
        {suffix && <span className="text-xs font-normal text-gray-400">{suffix}</span>}
      </p>
    </div>
  );
}
