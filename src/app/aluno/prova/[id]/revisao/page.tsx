'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

interface QuestaoRevisao {
  numero: number;
  enunciado: string;
  imagemUrl?: string;
  alternativas: string[];
  respostaAluno: number | null;
  respostaCorreta: number;
  acertou: boolean;
  feedback?: string;
}

interface RevisaoData {
  provaTitulo: string;
  nota: number;
  finalizada: string;
  totalQuestoes: number;
  acertos: number;
  questoes: QuestaoRevisao[];
}

export default function RevisaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tentativaId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<RevisaoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questaoAtual, setQuestaoAtual] = useState(0);

  useEffect(() => {
    fetch(`/api/aluno/tentativas/${tentativaId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao carregar revisão');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tentativaId]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['aluno']}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500">Carregando revisão...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !data) {
    return (
      <ProtectedRoute allowedRoles={['aluno']}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Erro ao carregar'}</p>
            <button onClick={() => router.push('/aluno')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Voltar
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const questao = data.questoes[questaoAtual];
  const letras = ['A', 'B', 'C', 'D', 'E'];

  return (
    <ProtectedRoute allowedRoles={['aluno']}>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
          <div className="p-5 border-b border-gray-200">
            <h2 className="font-bold text-gray-800 text-lg truncate">{data.provaTitulo}</h2>
            <p className="text-sm text-gray-500 mt-1">Revisão da Prova</p>
          </div>

          {/* Resumo */}
          <div className="p-5 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className={`text-2xl font-bold ${(data.nota ?? 0) >= 6 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.nota?.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">Nota</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{data.acertos}</p>
                <p className="text-xs text-gray-500">Acertos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{data.totalQuestoes - data.acertos}</p>
                <p className="text-xs text-gray-500">Erros</p>
              </div>
            </div>
          </div>

          {/* Grid de questões */}
          <div className="p-5 flex-1 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Questões</p>
            <div className="grid grid-cols-5 gap-2">
              {data.questoes.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuestaoAtual(i)}
                  className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                    i === questaoAtual
                      ? 'ring-2 ring-blue-500 ring-offset-1'
                      : ''
                  } ${
                    q.acertou
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {q.numero}
                </button>
              ))}
            </div>
          </div>

          {/* Voltar */}
          <div className="p-5 border-t border-gray-200">
            <button
              onClick={() => router.push('/aluno')}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            {/* Header da questão */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                  questao.acertou
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {questao.numero}
                </span>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Questão {questao.numero} de {data.totalQuestoes}
                  </h3>
                  <p className={`text-sm font-bold ${questao.acertou ? 'text-green-600' : 'text-red-600'}`}>
                    {questao.acertou ? 'Acertou' : 'Errou'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setQuestaoAtual(Math.max(0, questaoAtual - 1))}
                  disabled={questaoAtual === 0}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setQuestaoAtual(Math.min(data.totalQuestoes - 1, questaoAtual + 1))}
                  disabled={questaoAtual === data.totalQuestoes - 1}
                  className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Enunciado */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{questao.enunciado}</p>
              {questao.imagemUrl && (
                <img src={questao.imagemUrl} alt="Imagem da questão" className="mt-4 max-w-full rounded-lg border border-gray-200" />
              )}
            </div>

            {/* Alternativas */}
            <div className="space-y-3 mb-6">
              {questao.alternativas.map((alt, i) => {
                const isCorreta = i === questao.respostaCorreta;
                const isRespostaAluno = i === questao.respostaAluno;
                const isErroAluno = isRespostaAluno && !isCorreta;

                let bgClass = 'bg-white border-gray-200';
                let textClass = 'text-gray-800';
                let iconClass = '';

                if (isCorreta) {
                  bgClass = 'bg-green-50 border-green-300';
                  textClass = 'text-green-800';
                  iconClass = 'text-green-600';
                } else if (isErroAluno) {
                  bgClass = 'bg-red-50 border-red-300';
                  textClass = 'text-red-800';
                  iconClass = 'text-red-600';
                }

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 ${bgClass} transition-all`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isCorreta
                        ? 'bg-green-200 text-green-800'
                        : isErroAluno
                        ? 'bg-red-200 text-red-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {letras[i]}
                    </span>
                    <span className={`flex-1 text-sm ${textClass}`}>{alt}</span>
                    {isCorreta && (
                      <svg className={`w-5 h-5 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isErroAluno && (
                      <svg className={`w-5 h-5 ${iconClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {isRespostaAluno && (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        Sua resposta
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Feedback */}
            {questao.feedback && (
              <div className={`p-4 rounded-xl border ${
                questao.acertou
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <p className="text-sm font-bold mb-1">
                  {questao.acertou ? 'Parabéns!' : 'Atenção!'}
                </p>
                <p className="text-sm">{questao.feedback}</p>
              </div>
            )}

            {questao.respostaAluno === null && (
              <div className="p-4 rounded-xl border bg-yellow-50 border-yellow-200 text-yellow-800">
                <p className="text-sm font-bold">Questão não respondida</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
