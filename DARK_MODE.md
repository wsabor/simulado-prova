# 🎨 Sistema de Cores e Dark Mode

## Como Funciona

O sistema usa **variáveis CSS** que mudam automaticamente quando o dark mode é ativado.

### Ativação do Dark Mode

O dark mode é ativado de 3 formas:
1. **Clicando no botão de tema** (☀️ / 🌙 / 💻)
2. **Automático** - quando o modo "Sistema" está selecionado, segue a preferência do OS
3. **Classe CSS** - quando `.dark` é adicionada ao elemento `<html>`

### Variáveis CSS

Todas as cores são definidas em `app/globals.css` usando variáveis CSS:

```css
:root {
  --background: #ffffff;          /* Fundo principal */
  --foreground: #111827;          /* Texto principal */
  --input-background: #ffffff;    /* Fundo dos inputs */
  --input-text: #000000;          /* Texto dos inputs (PRETO) */
  /* ... mais variáveis */
}

.dark {
  --background: #0f172a;          /* Fundo escuro */
  --foreground: #f1f5f9;          /* Texto claro */
  --input-background: #1e293b;    /* Fundo escuro dos inputs */
  --input-text: #f1f5f9;          /* Texto claro dos inputs */
  /* ... mais variáveis */
}
```

### Override Automático do Tailwind

O `globals.css` sobrescreve automaticamente as classes do Tailwind:

| Classe Tailwind | Light Mode | Dark Mode |
|----------------|------------|-----------|
| `bg-gray-50` | #f9fafb | #1e293b |
| `bg-white` | #ffffff (branco) | #1e293b (escuro) |
| `text-gray-900` | #111827 (preto) | #f8fafc (branco) |
| `text-gray-600` | #4b5563 | #cbd5e1 |
| `border-gray-200` | #e5e7eb | #475569 |

**Isso significa que você NÃO precisa fazer nada especial!** Apenas use as classes normais do Tailwind e elas vão automaticamente respeitar o dark mode.

### Inputs

Os inputs têm tratamento especial:

**Light Mode:**
- ✅ Fundo: **BRANCO** (`#ffffff`)
- ✅ Texto: **PRETO** (`#000000`)
- ✅ Placeholder: Cinza médio (`#9ca3af`)
- ✅ Border: Cinza claro (`#d1d5db`)

**Dark Mode:**
- ✅ Fundo: Azul escuro (`#1e293b`)
- ✅ Texto: Branco (`#f1f5f9`)
- ✅ Placeholder: Cinza (`#64748b`)
- ✅ Border: Cinza escuro (`#475569`)

### Como Usar

#### 1. **Não mude nada no código existente**
As páginas que você já criou vão funcionar automaticamente com dark mode!

#### 2. **Para novos componentes**
Apenas use as classes normais do Tailwind:

```tsx
// ✅ CERTO - Usa classes Tailwind normais
<div className="bg-white border border-gray-200">
  <h1 className="text-gray-900">Título</h1>
  <p className="text-gray-600">Descrição</p>
  <input className="bg-white border border-gray-300" />
</div>
```

```tsx
// ❌ ERRADO - Não use cores hardcoded
<div style={{ backgroundColor: '#ffffff' }}>
  <h1 style={{ color: '#111827' }}>Título</h1>
</div>
```

### Cores Especiais

Se precisar de cores que não são grey/white/black:

```tsx
// Azul (primary)
<button className="bg-blue-600 hover:bg-blue-700 text-white">
  Botão
</button>

// Verde (success)
<div className="bg-green-100 text-green-800">
  Sucesso
</div>

// Vermelho (error)
<div className="bg-red-100 text-red-800">
  Erro
</div>
```

Estas cores também têm variantes para dark mode automaticamente!

### ThemeToggle Component

Para adicionar o botão de trocar tema em qualquer página:

```tsx
import { ThemeToggle } from '@/components/common/ThemeToggle';

<ThemeToggle />
```

### Theme Context

Para acessar o tema atual no código:

```tsx
import { useTheme } from '@/contexts/ThemeContext';

const { theme, setTheme, resolvedTheme } = useTheme();

// theme: 'light' | 'dark' | 'system'
// resolvedTheme: 'light' | 'dark' (sempre resolvido)
```

## Testando

1. Abra qualquer página do sistema
2. Clique no botão de tema no canto superior direito
3. Alterne entre:
   - ☀️ Claro
   - 🌙 Escuro
   - 💻 Sistema

**Tudo deve mudar automaticamente: backgrounds, textos, borders, inputs, etc!**

## Resultado Final

✅ **Inputs brancos com texto preto** no light mode
✅ **Dark mode completo** em todas as páginas
✅ **Automático** - nenhuma mudança necessária no código existente
✅ **Consistente** - todas as páginas seguem o mesmo tema
✅ **Persistente** - preferência salva no localStorage
