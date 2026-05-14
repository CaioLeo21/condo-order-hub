> **Documentação gerada por IA (Claude) e revisada por Leandro Valenca Silva.**

---

# Condo Order Hub

Sistema de gerenciamento de encomendas e cadastros para condomínios. Permite que porteiros registrem e controlem a entrada e retirada de pacotes, além de manter o cadastro de moradores e porteiros.

---

## Rodando localmente

**Pré-requisito:** Node.js 18+ instalado.

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Lint
npm run lint
```

O servidor sobe em `http://localhost:8080` por padrão.

---

## Acesso ao sistema

O sistema possui autenticação. Todos os usuários de teste têm senha `123456`.

| Email | Perfil | Condomínio |
|---|---|---|
| `admin@vistaverde.com` | Administrador | Residencial Vista Verde |
| `porteiro@vistaverde.com` | Porteiro | Residencial Vista Verde |
| `admin@solarbosque.com` | Administrador | Condomínio Solar do Bosque |
| `admin@torreazul.com` | Administrador | Edifício Torre Azul |

A sessão é mantida via `localStorage` — o login persiste ao recarregar a página.

---

## Perfis e permissões

| Ação | Porteiro | Administrador |
|---|:---:|:---:|
| Ver e registrar encomendas | ✓ | ✓ |
| Marcar encomenda como retirada | ✓ | ✓ |
| Editar encomenda | ✓ | ✓ |
| Excluir encomenda | — | ✓ |
| Ver moradores | ✓ | ✓ |
| Adicionar / editar / excluir morador | — | ✓ |
| Acessar módulo de Porteiros | — | ✓ |

A navegação se adapta ao perfil: o item **Porteiros** só aparece para administradores.

---

## Módulos

### Encomendas (`/`)

Painel principal. Exibe as encomendas registradas no condomínio com busca e filtros.

**Registrar encomenda** — Clique em "Nova Encomenda" e preencha:
- Destinatário e unidade
- Empresa remetente
- Código de rastreamento (opcional)
- Tamanho: Pequena / Média / Grande
- Porteiro que recebeu
- Descrição (opcional)

**Status possíveis:**
- `Recebida` — pacote na portaria, aguardando retirada
- `Retirada` — pacote retirado pelo morador

**Filtros disponíveis:** Todas · Recebidas · Retiradas · Busca por nome, unidade, empresa ou código.

**Ações por card:**
- Clique no card → abre modal com detalhes completos e opção de editar
- Botão "Marcar como Retirada" → registra data/hora de retirada automaticamente
- Excluir → disponível apenas para administradores, com confirmação

**Indicadores no topo:**
- Total de encomendas cadastradas
- Recebidas hoje (ainda na portaria)
- Total já retiradas

---

### Moradores (`/residents`)

Cadastro de moradores do condomínio.

**Campos:**
- Nome e telefone
- Unidade e Bloco (opcional)
- Tipo: `Proprietário` · `Inquilino` · `Outro` (campo adicional de descrição aparece quando "Outro" é selecionado)
- Status: `Ativo` · `Inativo`

Porteiros podem visualizar a lista. Apenas administradores podem adicionar, editar ou excluir moradores.

---

### Porteiros (`/doormen`) — somente Admin

Cadastro dos porteiros do condomínio.

**Campos:**
- Nome, CPF e telefone
- Turno: `Manhã` · `Tarde` · `Noite`
- Status: `Ativo` · `Inativo`

Porteiros não têm acesso a esta seção. A rota é protegida e o item de menu não aparece para o perfil `porteiro`.

---

## Tecnologias

- **Vite + React 18 + TypeScript**
- **shadcn/ui** — biblioteca de componentes (base slate, variáveis CSS)
- **Tailwind CSS** — estilização
- **React Router v6** — roteamento SPA
- **TanStack Query** — configurado como provider, ainda não utilizado para fetching
- **Lucide React** — ícones

---

## Observações técnicas

- **Sem backend:** todos os dados vivem em `useState` com arrays mockados dentro de cada página. Nenhuma chamada de rede é feita.
- **Autenticação mockada:** credenciais hardcoded em `src/contexts/AuthContext.tsx`. Sessão salva em `localStorage`.
- **Permissões centralizadas:** use sempre o hook `usePermissions()` — nunca verifique `user.role` diretamente em componentes.
- **Alias de importação:** `@/` aponta para `src/`. Use em todos os imports.
- **Sem testes:** não há suite de testes configurada.

