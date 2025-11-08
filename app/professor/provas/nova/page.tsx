"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { provaService } from "@/services/provaService";
import { questionService } from "@/services/questionService";
import { userService } from "@/services/userService";
import { ProvaFormData, User } from "@/types";

export default function NovaProvaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alunos, setAlunos] = useState<User[]>([]);
  const [questoesDisponiveis, setQuestoesDisponiveis] = useState<number>(0);
  const [materias, setMaterias] = useState<string[]>([]);

  const [formData, setFormData] = useState<ProvaFormData>({
    titulo: "",
    materias: [],
    semestres: [],
    numQuestoes: 20,
    tempoLimite: 60,
    alunosAtribuidos: [],
  });

  useEffect(() => {
    // Só carrega dados quando o user estiver disponível
    if (user) {
      loadAlunos();
      loadMaterias();
    }
  }, [user]);

  useEffect(() => {
    if (user && formData.materias.length > 0 && formData.semestres.length > 0) {
      checkQuestoesDisponiveis();
    } else {
      setQuestoesDisponiveis(0);
    }
  }, [formData.materias, formData.semestres, user]);

  const loadAlunos = async () => {
    try {
      const data = await userService.getAllAlunos();
      setAlunos(data);
    } catch (error) {
      console.error("Error loading alunos:", error);
    }
  };

  const loadMaterias = async () => {
    if (!user) return;

    try {
      const questions = await questionService.getQuestionsByProfessor(user.id);
      const uniqueMaterias = Array.from(
        new Set(questions.map((q) => q.materia))
      );
      setMaterias(uniqueMaterias);
    } catch (error) {
      console.error("Error loading materias:", error);
    }
  };

  const checkQuestoesDisponiveis = async () => {
    if (!user) return;

    try {
      const count = await questionService.countQuestionsByFilters(
        user.id,
        formData.materias,
        formData.semestres
      );
      setQuestoesDisponiveis(count);
    } catch (error) {
      console.error("Error counting questions:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validações
    if (!formData.titulo.trim()) {
      alert("Por favor, preencha o título da prova");
      return;
    }

    if (formData.materias.length === 0) {
      alert("Por favor, selecione pelo menos uma matéria");
      return;
    }

    if (formData.semestres.length === 0) {
      alert("Por favor, selecione pelo menos um semestre");
      return;
    }

    if (formData.numQuestoes > questoesDisponiveis) {
      alert(
        `Você selecionou ${formData.numQuestoes} questões, mas apenas ${questoesDisponiveis} estão disponíveis com os filtros selecionados.`
      );
      return;
    }

    if (formData.alunosAtribuidos.length === 0) {
      alert("Por favor, selecione pelo menos um aluno");
      return;
    }

    try {
      setLoading(true);
      await provaService.createProva(formData, user.id);
      alert("Prova criada com sucesso!");
      router.push("/professor/provas");
    } catch (error) {
      console.error("Error creating prova:", error);
      alert("Erro ao criar prova. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMateria = (materia: string) => {
    if (formData.materias.includes(materia)) {
      setFormData({
        ...formData,
        materias: formData.materias.filter((m) => m !== materia),
      });
    } else {
      setFormData({
        ...formData,
        materias: [...formData.materias, materia],
      });
    }
  };

  const toggleSemestre = (semestre: number) => {
    if (formData.semestres.includes(semestre)) {
      setFormData({
        ...formData,
        semestres: formData.semestres.filter((s) => s !== semestre),
      });
    } else {
      setFormData({
        ...formData,
        semestres: [...formData.semestres, semestre],
      });
    }
  };

  const toggleAluno = (alunoId: string) => {
    if (formData.alunosAtribuidos.includes(alunoId)) {
      setFormData({
        ...formData,
        alunosAtribuidos: formData.alunosAtribuidos.filter(
          (a) => a !== alunoId
        ),
      });
    } else {
      setFormData({
        ...formData,
        alunosAtribuidos: [...formData.alunosAtribuidos, alunoId],
      });
    }
  };

  const selecionarTodosAlunos = () => {
    if (formData.alunosAtribuidos.length === alunos.length) {
      setFormData({ ...formData, alunosAtribuidos: [] });
    } else {
      setFormData({ ...formData, alunosAtribuidos: alunos.map((a) => a.id) });
    }
  };

  return (
    <ProtectedRoute allowedRoles={["professor"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/professor/provas")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Nova Prova</h1>
                <p className="text-sm text-gray-500">Configurar simulado</p>
              </div>
            </div>
          </div>
        </header>

        {/* Form */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Informações Básicas
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Prova *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData({ ...formData, titulo: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Simulado Final - 3º Semestre"
                  required
                />
              </div>
            </div>

            {/* Matérias */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Matérias *
              </h2>
              {materias.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Você ainda não tem questões cadastradas.{" "}
                  <a
                    href="/professor/questoes/nova"
                    className="text-blue-600 hover:underline"
                  >
                    Criar questões
                  </a>
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {materias.map((materia) => (
                    <label
                      key={materia}
                      className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.materias.includes(materia)}
                        onChange={() => toggleMateria(materia)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {materia}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Semestres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Semestres *
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <label
                    key={sem}
                    className="flex items-center justify-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.semestres.includes(sem)}
                      onChange={() => toggleSemestre(sem)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {sem}º
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Configurações */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Configurações
              </h2>

              {/* Alert de questões disponíveis */}
              {formData.materias.length > 0 &&
                formData.semestres.length > 0 && (
                  <div
                    className={`mb-4 p-4 rounded-lg ${
                      questoesDisponiveis > 0
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-yellow-50 border border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className={`w-5 h-5 ${
                          questoesDisponiveis > 0
                            ? "text-blue-600"
                            : "text-yellow-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span
                        className={`text-sm font-medium ${
                          questoesDisponiveis > 0
                            ? "text-blue-800"
                            : "text-yellow-800"
                        }`}
                      >
                        {questoesDisponiveis} questões disponíveis com os
                        filtros selecionados
                      </span>
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Questões *
                  </label>
                  <select
                    value={formData.numQuestoes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numQuestoes: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {[10, 20, 30, 40, 50].map((num) => (
                      <option key={num} value={num}>
                        {num} questões
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo Limite (minutos) *
                  </label>
                  <input
                    type="number"
                    value={formData.tempoLimite}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tempoLimite: parseInt(e.target.value),
                      })
                    }
                    min="10"
                    max="240"
                    step="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Alunos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Atribuir Alunos *
                </h2>
                <button
                  type="button"
                  onClick={selecionarTodosAlunos}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {formData.alunosAtribuidos.length === alunos.length
                    ? "Desmarcar Todos"
                    : "Selecionar Todos"}
                </button>
              </div>

              {alunos.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhum aluno cadastrado no sistema ainda.
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {alunos.map((aluno) => (
                    <label
                      key={aluno.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.alunosAtribuidos.includes(aluno.id)}
                        onChange={() => toggleAluno(aluno.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {aluno.name}
                        </p>
                        <p className="text-xs text-gray-500">{aluno.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-3">
                {formData.alunosAtribuidos.length} aluno(s) selecionado(s)
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push("/professor/provas")}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Criar Prova
                  </>
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
