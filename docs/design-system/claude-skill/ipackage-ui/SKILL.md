---
name: ipackage-ui
description: Design system do iPackage (cores, tipografia, componentes e telas da portaria). Use sempre que criar ou alterar qualquer tela, componente, estilo, texto de interface ou config do Tailwind/shadcn neste app.
---

# iPackage UI

A referência visual do app está em `docs/design-system/`. Antes de mexer em UI, leia:

1. `docs/design-system/README.md` — regras de marca: voz e vocabulário (PT-BR), cor, tipografia, espaço, estados, iconografia, layout.
2. `docs/design-system/components/<Componente>.md` — quando usar cada componente e o que ele recebe.
3. `docs/design-system/telas/*.html` — as três telas da portaria como referência visual (abra no navegador).

`docs/design-system/components/bundle.js` e `bundle.css` são só a implementação de referência usada pelas telas HTML. Não importe no app.

## Onde o design system vive no código

| o quê | arquivo |
| --- | --- |
| variáveis de cor (claro e `.dark`), sombras, `--radius` | `src/index.css` |
| cores, fontes, `text-h1/h2/body/small/label/code`, raios, `h-control-*` | `tailwind.config.ts` |
| `cn()` com os tamanhos de texto registrados no tailwind-merge | `src/lib/utils.ts` |
| variantes de botão, badge (`pendente`, `retirada`, `muted`) e input | `src/components/ui/button.tsx`, `badge.tsx`, `input.tsx` |
| rótulos PT-BR (status, tipo, tamanho, turno, perfil) | `src/lib/labels.ts` |
| formatação de unidade, datas relativas e busca | `src/lib/format.ts` |

Componentes do app: `Header` (AppBar), `Wordmark` e `LogoMark` (logotipo, em `Logo.tsx`; cores fixas de marca, nunca refaça em CSS), `PageHeader`, `SearchInput`, `FilterTabs`, `EmptyState`, `StatusBadge`, `PackageCard`, `OptionGroup`, `SignaturePad`, em `src/components/`.

## Regras ao construir

- Só tokens: nada de hex, `rgb()` ou cores padrão do Tailwind (`bg-blue-600`, `text-gray-500`). Use `bg-primary`, `text-muted-foreground`, `bg-pendente text-pendente-foreground` etc.
- Se criar um tamanho de texto novo no `tailwind.config.ts`, registre também em `src/lib/utils.ts`, senão o `cn()` remove a classe.
- Uma ação primary por tela; Cancelar e voltar são `ghost`.
- Alvos de toque de 44px (`h-control-md`, padrão do `Button` e do `Input`).
- Status de encomenda sempre com `StatusBadge` (ícone + palavra).
- Escolhas únicas com poucas opções (tipo, tamanho, morador, quem retira) usam `OptionGroup`, não `Select`.
- Unidade como identificador em `font-mono text-code`, formatada por `formatUnit()` ("Bloco B · Apto 204" ou "Quadra 3 · Casa 12").
- Datas com `formatWhen()` ("Hoje às 14:32", "Ontem às 09:10", "12/10 às 09:10").
- Textos em PT-BR, sentence case, verbo no início dos botões, sem emoji, com o vocabulário do README (encomenda, morador, unidade, bloco/quadra, portaria).
- Ícones de `lucide-react`.
- Nunca passe genéricos dentro do JSX (`<OptionGroup<PackageKind> …>`): o `lovable-tagger` do modo dev quebra. Tipe as opções (`const OPTIONS: OptionGroupOption<PackageKind>[]`).
- Ao terminar uma tela, confira nos temas claro e escuro (adicione a classe `dark` no `<html>`).

O design system editável fica num artifact do claude.ai mantido pelo Caio. Se os tokens mudarem lá, ele atualiza `docs/design-system/` e `src/index.css`. Não invente valores novos sem pedir.
