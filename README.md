# Simulado Prova - Sistema de Provas Online

Sistema de simulados e provas online desenvolvido para uso em sala de aula. Permite que professores criem questões, montem provas e acompanhem o desempenho dos alunos em tempo real.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend:** API Routes (Next.js), NextAuth.js v4 (JWT)
- **Banco de dados:** MongoDB 8 (Mongoose)
- **Deploy:** Docker Compose (Proxmox/Debian)
- **CI/CD:** GitHub Actions + Cloudflare Tunnel

## Funcionalidades

### Professor / Admin

- Cadastro e gerenciamento de questões (com suporte a imagens)
- Importacao de questoes em lote via JSON
- Criacao de provas com selecao de materias, semestres e numero de questoes
- Atribuicao de provas a alunos especificos
- Ativar/desativar provas
- Cadastro de alunos com atribuicao de turma
- Soft-delete de alunos (desativar/ativar sem perder historico)
- Painel de resultados com estatisticas, graficos e filtros (turma, prova, materia, semestre)

### Aluno

- Dashboard com provas disponiveis e realizadas
- Interface de prova estilo SATE/Cebraspe (sidebar + painel de questao)
- Timer com contagem regressiva e auto-finalizacao
- Navegacao entre questoes via grid numerado
- Embaralhamento de questoes e alternativas
- Resultado imediato apos finalizacao com nota e acertos
- Media geral calculada automaticamente
- 1 tentativa por prova (regra de negocio)

### Sistema

- Autenticacao com NextAuth.js (Credentials + JWT)
- 3 roles: admin, professor, aluno
- Usuarios inativos sao bloqueados no login
- Troca de senha pelo perfil do usuario

## Requisitos

- Docker e Docker Compose
- Git

## Setup Local (Desenvolvimento)

```bash
git clone https://github.com/wsabor/simulado-prova.git
cd simulado-prova
npm install
```

Inicie um container MongoDB:

```bash
docker run -d --name mongo-dev -p 27017:27017 mongo:8
```

Crie o arquivo `.env.local`:

```
MONGODB_URI=mongodb://localhost:27017/simulado-prova
NEXTAUTH_SECRET=troque-por-uma-string-aleatoria
NEXTAUTH_URL=http://localhost:3000
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Deploy com Docker Compose (Producao)

```bash
git clone https://github.com/wsabor/simulado-prova.git
cd simulado-prova
```

Configure o `.env`:

```
NEXTAUTH_SECRET=string-secreta-com-32-chars-minimo
NEXTAUTH_URL=http://IP_DO_SERVIDOR:3000
```

Suba os containers:

```bash
docker compose up -d --build
```

Crie o primeiro usuario admin:

```bash
docker compose exec mongo mongosh simulado-prova --eval '
db.users.insertOne({
  name: "Admin",
  email: "admin@email.com",
  password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  role: "admin",
  ativo: true,
  createdAt: new Date()
})'
```

> Senha temporaria: `password` - troque pelo perfil do usuario apos o primeiro login.

## Importacao de Questoes em Lote

Acesse `/professor/questoes/importar` e cole ou carregue um JSON no formato:

```json
[
  {
    "enunciado": "Qual linguagem e usada para estilizar paginas web?",
    "alternativas": ["Python", "CSS", "Java", "SQL", "PHP"],
    "alternativaCorreta": 1,
    "materia": "Desenvolvimento Web",
    "semestre": 1
  }
]
```

## Estrutura do Projeto

```
src/
  app/
    api/              # API Routes
      aluno/          # Rotas do aluno (provas, tentativas)
      auth/           # NextAuth.js
      professor/      # Rotas do professor (resultados)
      provas/         # CRUD de provas
      questions/      # CRUD e importacao de questoes
      users/          # CRUD de usuarios
    aluno/            # Paginas do aluno
    professor/        # Paginas do professor
    login/            # Pagina de login
  components/         # Componentes reutilizaveis
  contexts/           # AuthContext
  lib/                # Conexao MongoDB
  models/             # Schemas Mongoose
  types/              # TypeScript types
```

## CI/CD

O projeto usa GitHub Actions com dois workflows:

- **CI** (`ci.yml`): Type check + build a cada push/PR
- **Deploy** (`deploy.yml`): Build + deploy automatico via SSH (Cloudflare Tunnel) ao fazer push na main

## Licenca

Projeto desenvolvido para uso educacional no SENAI.
