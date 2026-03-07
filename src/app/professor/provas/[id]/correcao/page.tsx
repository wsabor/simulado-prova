'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

interface QuestaoCorrecao {
  numero: number;
  enunciado: string;
  imagemUrl?: string;
  alternativas: string[];
  respostaCorreta: number;
  feedbackAcerto?: string;
  feedbackErro?: string;
  materia: string;
  semestre: number;
}

interface CorrecaoData {
  provaTitulo: string;
  totalQuestoes: number;
  questoes: QuestaoCorrecao[];
}

export default function CorrecaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: provaId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<CorrecaoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarGabarito, setMostrarGabarito] = useState(true);
  const [mostrarFeedback, setMostrarFeedback] = useState(true);

  useEffect(() => {
    fetch(`/api/professor/provas/${provaId}/correcao`)
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao carregar');
        return res.json();
      })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [provaId]);

  const letras = ['A', 'B', 'C', 'D', 'E'];

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['professor', 'admin']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500">Carregando correção...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!data) {
    return (
      <ProtectedRoute allowedRoles={['professor', 'admin']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-red-600">Erro ao carregar prova</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['professor', 'admin']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/professor/provas')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{data.provaTitulo}</h1>
                  <p className="text-sm text-gray-500">
                    Correção — {data.totalQuestoes} questões
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={mostrarGabarito}
                    onChange={(e) => setMostrarGabarito(e.target.checked)}
                    className="rounded"
                  />
                  Gabarito
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={mostrarFeedback}
                    onChange={(e) => setMostrarFeedback(e.target.checked)}
                    className="rounded"
                  />
                  Feedback
                </label>
              </div>
            </div>
          </div>
        </header>

        {/* Questões */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {data.questoes.map((q) => (
            <div key={q.numero} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header da questão */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                    {q.numero}
                  </span>
                  <span className="text-sm text-gray-500">
                    {q.materia} — {q.semestre}º Semestre
                  </span>
                </div>
                {mostrarGabarito && (
                  <span className="text-sm font-bold text-green-600">
                    Gabarito: {letras[q.respostaCorreta]}
                  </span>
                )}
              </div>

              {/* Enunciado */}
              <div className="px-6 py-4">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{q.enunciado}</p>
                {q.imagemUrl && (
                  <img src={q.imagemUrl} alt="Imagem da questão" className="mt-4 max-w-full rounded-lg border border-gray-200" />
                )}
              </div>

              {/* Alternativas */}
              <div className="px-6 pb-4 space-y-2">
                {q.alternativas.map((alt, i) => {
                  const isCorreta = i === q.respostaCorreta;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        mostrarGabarito && isCorreta
                          ? 'bg-green-50 border-green-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                        mostrarGabarito && isCorreta
                          ? 'bg-green-200 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {letras[i]}
                      </span>
                      <span className={`text-sm ${
                        mostrarGabarito && isCorreta ? 'text-green-800 font-medium' : 'text-gray-700'
                      }`}>
                        {alt}
                      </span>
                      {mostrarGabarito && isCorreta && (
                        <svg className="w-4 h-4 text-green-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Feedback */}
              {mostrarFeedback && (q.feedbackAcerto || q.feedbackErro) && (
                <div className="px-6 pb-4 space-y-2">
                  {q.feedbackAcerto && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-xs font-bold text-green-700 mb-1">Feedback de Acerto:</p>
                      <p className="text-sm text-green-800">{q.feedbackAcerto}</p>
                    </div>
                  )}
                  {q.feedbackErro && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-xs font-bold text-red-700 mb-1">Feedback de Erro:</p>
                      <p className="text-sm text-red-800">{q.feedbackErro}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </main>
      </div>
    </ProtectedRoute>
  );
}
