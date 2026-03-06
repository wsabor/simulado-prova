'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

interface QuestaoProva {
  questionId: string;
  enunciado: string;
  materia: string;
  imagemUrl: string | null;
  alternativas: { texto: string }[];
  respostaAluno: number | null;
}

interface ProvaData {
  tentativaId: string;
  provaTitle: string;
  tempoRestante: number;
  questoes: QuestaoProva[];
}

const LETRAS = ['a', 'b', 'c', 'd', 'e'];

export default function ProvaPage() {
  const { id: provaId } = useParams<{ id: string }>();
  const router = useRouter();

  const [prova, setProva] = useState<ProvaData | null>(null);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<(number | null)[]>([]);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [finalizando, setFinalizando] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);

  const tentativaIdRef = useRef<string>('');

  // Iniciar prova
  useEffect(() => {
    const iniciar = async () => {
      try {
        const res = await fetch(`/api/aluno/provas/${provaId}/iniciar`, {
          method: 'POST',
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Erro ao iniciar prova');
        }
        const data: ProvaData = await res.json();
        setProva(data);
        setRespostas(data.questoes.map((q) => q.respostaAluno));
        setTempoRestante(data.tempoRestante);
        tentativaIdRef.current = data.tentativaId;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao iniciar prova');
      } finally {
        setLoading(false);
      }
    };
    iniciar();
  }, [provaId]);

  // Timer
  useEffect(() => {
    if (!prova || tempoRestante <= 0) return;
    const interval = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finalizarProva();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [prova]);

  const formatTempo = (segundos: number) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min`;
    return `${m}min ${s.toString().padStart(2, '0')}s`;
  };

  // Salvar resposta no servidor
  const salvarResposta = useCallback(
    async (questionIndex: number, resposta: number | null) => {
      try {
        await fetch(`/api/aluno/provas/${provaId}/responder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tentativaId: tentativaIdRef.current,
            questionIndex,
            resposta,
          }),
        });
      } catch {
        // Silently fail - resposta salva localmente
      }
    },
    [provaId]
  );

  const handleResposta = (alternativaIndex: number) => {
    const novasRespostas = [...respostas];
    novasRespostas[questaoAtual] = alternativaIndex;
    setRespostas(novasRespostas);
    salvarResposta(questaoAtual, alternativaIndex);
  };

  const handleApagarResposta = () => {
    const novasRespostas = [...respostas];
    novasRespostas[questaoAtual] = null;
    setRespostas(novasRespostas);
    salvarResposta(questaoAtual, null);
  };

  const finalizarProva = async () => {
    if (finalizando) return;
    setFinalizando(true);
    try {
      const res = await fetch(`/api/aluno/provas/${provaId}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tentativaId: tentativaIdRef.current }),
      });
      if (!res.ok) throw new Error('Erro ao finalizar');
      const resultado = await res.json();
      // Redirecionar para resultado
      router.push(
        `/aluno/prova/${provaId}/resultado?nota=${resultado.nota}&acertos=${resultado.acertos}&total=${resultado.total}`
      );
    } catch {
      setFinalizando(false);
      alert('Erro ao finalizar a prova. Tente novamente.');
    }
  };

  const respondidas = respostas.filter((r) => r !== null).length;
  const emBranco = respostas.length - respondidas;

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['aluno']}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando prova...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !prova) {
    return (
      <ProtectedRoute allowedRoles={['aluno']}>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={() => router.push('/aluno')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const questao = prova.questoes[questaoAtual];

  return (
    <ProtectedRoute allowedRoles={['aluno']}>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar esquerda */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
          {/* Header da sidebar */}
          <div className="bg-blue-700 text-white p-4">
            <h2 className="font-bold text-lg truncate">{prova.provaTitle}</h2>
            <p className="text-blue-200 text-sm mt-1">{questao.materia}</p>
          </div>

          {/* Timer */}
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`font-bold text-lg ${tempoRestante < 300 ? 'text-red-600' : 'text-blue-800'}`}>
                Restam: {formatTempo(tempoRestante)}
              </span>
            </div>
          </div>

          {/* Resumo da prova */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Resumo da Prova
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                <span className="text-gray-700">
                  <strong>{respondidas}</strong> {respondidas === 1 ? 'Questão respondida' : 'Questões respondidas'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-gray-300 inline-block"></span>
                <span className="text-gray-700">
                  <strong>{emBranco}</strong> {emBranco === 1 ? 'Questão em branco' : 'Questões em branco'}
                </span>
              </div>
            </div>
          </div>

          {/* Grid de questões */}
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Questões da Prova
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {prova.questoes.map((_, idx) => {
                const isAtual = idx === questaoAtual;
                const isRespondida = respostas[idx] !== null;
                return (
                  <button
                    key={idx}
                    onClick={() => setQuestaoAtual(idx)}
                    className={`
                      w-10 h-10 rounded-lg text-sm font-bold transition-all
                      ${isAtual
                        ? 'bg-orange-500 text-white ring-2 ring-orange-300 shadow-md'
                        : isRespondida
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navegação e finalizar */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            {/* Setas de navegação */}
            <div className="flex justify-between">
              <button
                onClick={() => setQuestaoAtual(Math.max(0, questaoAtual - 1))}
                disabled={questaoAtual === 0}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>
              <button
                onClick={() => setQuestaoAtual(Math.min(prova.questoes.length - 1, questaoAtual + 1))}
                disabled={questaoAtual === prova.questoes.length - 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Botão finalizar */}
            <button
              onClick={() => setConfirmFinish(true)}
              className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
            >
              Finalizar Prova
            </button>
          </div>
        </aside>

        {/* Painel principal - Questão */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {/* Header da questão */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-700 text-white text-sm font-bold px-3 py-1 rounded-lg">
                  Questão {questaoAtual + 1}
                </span>
                <span className="text-sm text-gray-500">
                  {questao.materia}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded">
                <div
                  className="h-1 bg-blue-600 rounded transition-all"
                  style={{ width: `${((questaoAtual + 1) / prova.questoes.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Enunciado */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                {questao.enunciado}
              </p>
              {questao.imagemUrl && (
                <div className="mt-4">
                  <img
                    src={questao.imagemUrl}
                    alt="Imagem da questão"
                    className="max-w-full rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Alternativas */}
            <div className="space-y-3 mb-6">
              {questao.alternativas.map((alt, idx) => {
                const selecionada = respostas[questaoAtual] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleResposta(idx)}
                    className={`
                      w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all
                      ${selecionada
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span
                      className={`
                        flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                        ${selecionada
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                        }
                      `}
                    >
                      {LETRAS[idx]}
                    </span>
                    <span className={`text-sm leading-relaxed pt-1.5 ${selecionada ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                      {alt.texto}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Apagar resposta */}
            {respostas[questaoAtual] !== null && (
              <button
                onClick={handleApagarResposta}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Apagar resposta
              </button>
            )}
          </div>
        </main>

        {/* Modal de confirmação */}
        {confirmFinish && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Finalizar Prova?</h3>
              <p className="text-gray-600 mb-4">
                Você respondeu <strong>{respondidas}</strong> de <strong>{prova.questoes.length}</strong> questões.
                {emBranco > 0 && (
                  <span className="text-red-600">
                    {' '}{emBranco} {emBranco === 1 ? 'questão ficará' : 'questões ficarão'} em branco.
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Após finalizar, você não poderá alterar suas respostas.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmFinish(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Continuar respondendo
                </button>
                <button
                  onClick={() => {
                    setConfirmFinish(false);
                    finalizarProva();
                  }}
                  disabled={finalizando}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {finalizando ? 'Finalizando...' : 'Finalizar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
