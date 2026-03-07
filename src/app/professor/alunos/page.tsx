'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ProfessorLayout } from '@/components/professor/ProfessorLayout';

interface Aluno {
  id: string;
  name: string;
  email: string;
  turma: string;
  ativo: boolean;
  createdAt: string;
}

interface ImportResult {
  name: string;
  email: string;
  status: 'criado' | 'erro';
  erro?: string;
}

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turma, setTurma] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Import CSV state
  const [showImport, setShowImport] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [senhaPadrao, setSenhaPadrao] = useState('senai123');
  const [turmaImport, setTurmaImport] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const toggleAtivo = async (alunoId: string, ativo: boolean) => {
    try {
      const res = await fetch(`/api/users/${alunoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo }),
      });
      if (res.ok) {
        setAlunos((prev) =>
          prev.map((a) => (a.id === alunoId ? { ...a, ativo } : a))
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const resetSenha = async (alunoId: string, alunoName: string) => {
    const novaSenha = prompt(`Nova senha para "${alunoName}" (mínimo 4 caracteres):`);
    if (!novaSenha) return;
    if (novaSenha.length < 4) {
      alert('Senha deve ter no mínimo 4 caracteres');
      return;
    }
    try {
      const res = await fetch(`/api/users/${alunoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novaSenha }),
      });
      if (res.ok) {
        alert(`Senha de "${alunoName}" resetada com sucesso!`);
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao resetar senha');
      }
    } catch {
      alert('Erro de conexão ao resetar senha');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvText(evt.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string): { name: string; email: string; turma?: string }[] => {
    const lines = text.trim().split('\n');
    const results: { name: string; email: string; turma?: string }[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Pular cabeçalho
      const lower = trimmed.toLowerCase();
      if (lower.startsWith('nome') || lower.startsWith('name') || lower.startsWith('aluno')) continue;

      // Suportar separador ; e ,
      const sep = trimmed.includes(';') ? ';' : ',';
      const parts = trimmed.split(sep).map((p) => p.trim().replace(/^["']|["']$/g, ''));

      if (parts.length >= 2) {
        results.push({
          name: parts[0],
          email: parts[1],
          turma: parts[2] || turmaImport || undefined,
        });
      } else if (parts.length === 1 && parts[0].includes('@')) {
        // Só email - usar parte antes do @ como nome
        const emailPart = parts[0];
        const namePart = emailPart.split('@')[0].replace(/[._]/g, ' ');
        results.push({ name: namePart, email: emailPart, turma: turmaImport || undefined });
      }
    }
    return results;
  };

  const handleImport = async () => {
    const parsed = parseCSV(csvText);
    if (parsed.length === 0) {
      setMessage({ type: 'error', text: 'Nenhum aluno encontrado no CSV. Use o formato: nome, email, turma' });
      return;
    }

    setImporting(true);
    setImportResults(null);
    try {
      const res = await fetch('/api/users/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alunos: parsed.map((a) => ({ ...a, turma: a.turma || turmaImport })),
          senhaPadrao: senhaPadrao || 'senai123',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setImportResults(data.resultados);
        setMessage({
          type: data.erros > 0 ? 'error' : 'success',
          text: `Importação concluída: ${data.criados} criados, ${data.erros} erros de ${data.total} total`,
        });
        if (data.criados > 0) fetchAlunos();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao importar alunos' });
    } finally {
      setImporting(false);
    }
  };

  // Agrupar alunos por turma
  const turmas = [...new Set(alunos.map((a) => a.turma || 'Sem turma'))].sort();

  return (
    <ProfessorLayout titulo="Gerenciar Alunos" subtitulo={`${alunos.length} alunos cadastrados`}>
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

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => { setShowImport(true); setImportResults(null); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Importar CSV em Lote
              </button>
            </div>
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
                          <div key={aluno.id} className={`px-6 py-3 flex items-center justify-between ${!aluno.ativo ? 'opacity-50 bg-gray-50' : ''}`}>
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {aluno.name}
                                  {!aluno.ativo && (
                                    <span className="ml-2 text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                      Inativo
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">{aluno.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">
                                {new Date(aluno.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                              <button
                                onClick={() => resetSenha(aluno.id, aluno.name)}
                                className="text-xs font-medium px-3 py-1 rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                              >
                                Resetar Senha
                              </button>
                              <button
                                onClick={() => toggleAtivo(aluno.id, !aluno.ativo)}
                                className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                                  aluno.ativo
                                    ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                    : 'text-green-600 bg-green-50 hover:bg-green-100'
                                }`}
                              >
                                {aluno.ativo ? 'Desativar' : 'Ativar'}
                              </button>
                            </div>
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

      {/* Modal de Importação CSV */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => !importing && setShowImport(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header do modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Importar Alunos via CSV</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Formato: <code className="bg-gray-100 px-1 rounded">nome, email, turma</code> — separador <code className="bg-gray-100 px-1 rounded">;</code> ou <code className="bg-gray-100 px-1 rounded">,</code>
                </p>
              </div>
              <button
                onClick={() => !importing && setShowImport(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo do modal */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo CSV</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ou cole os dados aqui
                </label>
                <textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={"João Silva, joao@email.com, DS 2025/1\nMaria Santos, maria@email.com, DS 2025/1"}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha padrão</label>
                  <input
                    type="text"
                    value={senhaPadrao}
                    onChange={(e) => setSenhaPadrao(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="senai123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Turma padrão</label>
                  <input
                    type="text"
                    value={turmaImport}
                    onChange={(e) => setTurmaImport(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: DS 2025/1"
                  />
                </div>
              </div>

              {csvText && (
                <p className="text-xs text-gray-500">
                  {parseCSV(csvText).length} aluno(s) detectado(s)
                </p>
              )}

              {/* Resultados da importação */}
              {importResults && (
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {importResults.map((r, i) => (
                    <div key={i} className={`px-3 py-2 text-xs flex items-center justify-between ${r.status === 'erro' ? 'bg-red-50' : 'bg-green-50'}`}>
                      <span className="font-medium text-gray-800 truncate mr-2">{r.name}</span>
                      <span className={r.status === 'erro' ? 'text-red-600' : 'text-green-600'}>
                        {r.status === 'erro' ? r.erro : 'Criado'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer do modal */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => !importing && setShowImport(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !csvText.trim()}
                className="flex-1 bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importando...' : `Importar ${parseCSV(csvText).length} Aluno(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProfessorLayout>
  );
}
