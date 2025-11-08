'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { questionService } from '@/services/questionService';
import { Question } from '@/types';

export default function QuestoesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroMateria, setFiltroMateria] = useState('');
  const [filtroSemestre, setFiltroSemestre] = useState('');
  const [materias, setMaterias] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadQuestions();
    }
  }, [user]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionService.getQuestionsByProfessor(user!.id);
      setQuestions(data);
      
      // Extrair matérias únicas
      const uniqueMaterias = Array.from(new Set(data.map(q => q.materia)));
      setMaterias(uniqueMaterias);
    } catch (error) {
      console.error('Error loading questions:', error);
      alert('Erro ao carregar questões');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta questão?')) {
      return;
    }

    try {
      await questionService.deleteQuestion(questionId);
      await loadQuestions();
      alert('Questão excluída com sucesso!');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Erro ao excluir questão');
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (filtroMateria && q.materia !== filtroMateria) return false;
    if (filtroSemestre && q.semestre.toString() !== filtroSemestre) return false;
    return true;
  });

  return (
    <ProtectedRoute allowedRoles={['professor']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/professor')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Banco de Questões</h1>
                  <p className="text-sm text-gray-500">{filteredQuestions.length} questões encontradas</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/professor/questoes/nova')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova Questão
              </button>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Matéria
                </label>
                <select
                  value={filtroMateria}
                  onChange={(e) => setFiltroMateria(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas as matérias</option>
                  {materias.map(materia => (
                    <option key={materia} value={materia}>{materia}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Semestre
                </label>
                <select
                  value={filtroSemestre}
                  onChange={(e) => setFiltroSemestre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os semestres</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>{sem}º Semestre</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFiltroMateria('');
                    setFiltroSemestre('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Carregando questões...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma questão encontrada</h3>
              <p className="text-gray-500 mb-6">
                {filtroMateria || filtroSemestre 
                  ? 'Tente ajustar os filtros ou criar uma nova questão'
                  : 'Comece criando sua primeira questão'
                }
              </p>
              <button
                onClick={() => router.push('/professor/questoes/nova')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar Primeira Questão
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question, index) => (
                <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {question.materia}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                          {question.semestre}º Semestre
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Questão #{index + 1}
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{question.enunciado}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => router.push(`/professor/questoes/editar/${question.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {question.alternativas.map((alt, altIndex) => (
                      <div
                        key={altIndex}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          alt.correta ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full text-sm font-medium">
                          {String.fromCharCode(97 + altIndex)}
                        </span>
                        <span className={`flex-1 ${alt.correta ? 'font-medium text-green-900' : 'text-gray-700'}`}>
                          {alt.texto}
                        </span>
                        {alt.correta && (
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
