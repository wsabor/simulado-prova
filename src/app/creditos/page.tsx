"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const VERSAO = "1.0.0";

const stack = [
  {
    nome: "Next.js 16",
    descricao: "Framework React com App Router",
    cor: "bg-black text-white",
  },
  {
    nome: "React 19",
    descricao: "Biblioteca de interfaces",
    cor: "bg-blue-500 text-white",
  },
  {
    nome: "Tailwind CSS v4",
    descricao: "Framework de estilos utilitários",
    cor: "bg-cyan-500 text-white",
  },
  {
    nome: "MongoDB 8",
    descricao: "Banco de dados NoSQL",
    cor: "bg-green-600 text-white",
  },
  {
    nome: "Mongoose",
    descricao: "ODM para MongoDB",
    cor: "bg-red-600 text-white",
  },
  {
    nome: "NextAuth.js v4",
    descricao: "Autenticação com JWT",
    cor: "bg-purple-600 text-white",
  },
  {
    nome: "Docker",
    descricao: "Containerização e deploy",
    cor: "bg-blue-600 text-white",
  },
  {
    nome: "GitHub Actions",
    descricao: "CI/CD automatizado",
    cor: "bg-gray-700 text-white",
  },
];

export default function CreditosPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-10 text-center text-white">
            <h1 className="text-3xl font-bold">Sistema de Provas Online</h1>
            <p className="text-blue-200 mt-2">Versão {VERSAO}</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Desenvolvedor */}
            <div className="text-center">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Desenvolvido por
              </h2>
              <p className="text-2xl font-bold text-gray-900">Wagner Sabor</p>
              <p className="text-gray-500 mt-1">
                Professor de Tecnologia da Informação
              </p>
              <Link
                href="https://wsabor.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 mt-1"
              >
                wsabor.dev
              </Link>
            </div>

            {/* Stack */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 text-center">
                Stack Tecnológica
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {stack.map((tech) => (
                  <div
                    key={tech.nome}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${tech.cor}`}
                    >
                      {tech.nome.split(" ")[0]}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {tech.nome}
                      </p>
                      <p className="text-xs text-gray-500">{tech.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sobre */}
            <div className="bg-gray-50 rounded-xl p-5 text-center">
              <p className="text-sm text-gray-600 leading-relaxed">
                Sistema desenvolvido para uso educacional em sala de aula.
                Permite que professores criem questões, montem provas e
                acompanhem o desempenho dos alunos em tempo real.
              </p>
            </div>

            {/* Voltar */}
            <div className="text-center">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          &copy; {new Date().getFullYear()} wsabor.dev — Todos os direitos
          reservados
        </p>
      </div>
    </div>
  );
}
