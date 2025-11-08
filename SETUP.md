# Sistema de Provas - Simulados Online

Sistema whitelabel para aplicação de provas simuladas com Next.js, TypeScript, TailwindCSS e Firebase.

## 🚀 Primeiros Passos

### 1. Instalar Dependências

```bash
npm install firebase
```

### 2. Configurar Firebase

#### 2.1 No Firebase Console (https://console.firebase.google.com):

1. **Ativar Authentication:**
   - Vá em `Authentication` > `Sign-in method`
   - Ative o provedor `Google`
   - Configure o domínio autorizado (localhost para dev)

2. **Ativar Firestore:**
   - Vá em `Firestore Database`
   - Crie o banco em modo de produção
   - Configure as regras iniciais (veja abaixo)

3. **Obter Credenciais:**
   - Vá em `Project Settings` (engrenagem) > `General`
   - Role até "Your apps" e clique em `</>`
   - Copie as configurações do Firebase

#### 2.2 Configurar Variáveis de Ambiente:

Edite o arquivo `.env.local` com suas credenciais do Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### 3. Configurar Regras do Firestore

No Firebase Console, vá em `Firestore Database` > `Regras` e adicione:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Questions collection
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'professor';
      allow update, delete: if request.auth != null && 
                             resource.data.professorId == request.auth.uid;
    }
    
    // Provas collection
    match /provas/{provaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'professor';
      allow update, delete: if request.auth != null && 
                             resource.data.professorId == request.auth.uid;
    }
    
    // Tentativas collection
    match /tentativas/{tentativaId} {
      allow read: if request.auth != null && 
                    (resource.data.alunoId == request.auth.uid || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'professor');
      allow create: if request.auth != null && 
                      request.resource.data.alunoId == request.auth.uid;
      allow update: if request.auth != null && 
                      resource.data.alunoId == request.auth.uid;
    }
  }
}
```

### 4. Rodar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
simulado-prova/
├── app/
│   ├── login/              # Página de login
│   ├── professor/          # Dashboard do professor
│   ├── aluno/              # Dashboard do aluno
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página inicial (redirect)
├── src/
│   ├── components/
│   │   ├── common/         # Componentes compartilhados
│   │   ├── professor/      # Componentes do professor
│   │   └── aluno/          # Componentes do aluno
│   ├── contexts/
│   │   └── AuthContext.tsx # Context de autenticação
│   ├── lib/
│   │   └── firebase.ts     # Configuração do Firebase
│   └── types/
│       └── index.ts        # TypeScript types
└── .env.local              # Variáveis de ambiente
```

## 🗄️ Estrutura do Banco de Dados

### Collections:

#### `users/`
```typescript
{
  name: string;
  email: string;
  role: 'professor' | 'aluno';
  photoURL?: string;
  createdAt: Date;
}
```

#### `questions/`
```typescript
{
  enunciado: string;
  alternativas: [
    { texto: string, correta: boolean }
  ];
  materia: string;
  semestre: number;
  professorId: string;
  createdAt: Date;
  imagemUrl?: string;
}
```

#### `provas/`
```typescript
{
  titulo: string;
  materias: string[];
  semestres: number[];
  numQuestoes: number;
  tempoLimite: number; // minutos
  professorId: string;
  ativa: boolean;
  alunosAtribuidos: string[];
  createdAt: Date;
}
```

#### `tentativas/`
```typescript
{
  provaId: string;
  alunoId: string;
  questoesSorteadas: [
    {
      questionId: string;
      ordemEmbaralhada: number[];
      respostaAluno: number | null;
    }
  ];
  iniciada: Date;
  finalizada: Date | null;
  nota: number | null;
  tempoRestante: number; // segundos
}
```

## 👤 Primeiro Acesso

### Criar Primeiro Professor:

1. Faça login com Google
2. Acesse o Firestore Console
3. Encontre o documento do seu usuário em `users/{seu-uid}`
4. Edite o campo `role` de `"aluno"` para `"professor"`
5. Faça logout e login novamente

## 📝 Próximos Passos

Agora que a estrutura base está pronta, vamos desenvolver:

1. ✅ Autenticação e proteção de rotas
2. ⏳ CRUD de Questões
3. ⏳ Criação de Provas
4. ⏳ Interface de realização da prova
5. ⏳ Sistema de correção automática
6. ⏳ Visualização de resultados

## 🛠️ Stack Tecnológica

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **Backend:** Firebase (Auth + Firestore)
- **Hosting:** Vercel

## 📧 Suporte

Em caso de dúvidas, consulte a documentação:
- [Next.js](https://nextjs.org/docs)
- [Firebase](https://firebase.google.com/docs)
- [TailwindCSS](https://tailwindcss.com/docs)
