iPackage é o sistema da portaria: o porteiro registra a encomenda que chegou, o morador retira, e o condomínio sabe o que está parado. A interface é uma ferramenta de balcão — rápida de ler em pé, com uma mão ocupada segurando uma caixa.

## Princípios

- **Conferir em 2 segundos.** Unidade, nome do morador e status são as três coisas que o porteiro procura. Elas vêm primeiro, maiores e no mesmo lugar em toda tela.
- **Status nunca só por cor.** Pendente e Retirada sempre levam a palavra e um ícone, além da cor.
- **Toque antes de mouse.** A portaria usa tablet ou celular: controles com `control-md` (44px) por padrão.
- **Calmo por padrão, kraft para a marca.** A UI é neutra e verde-petróleo; o laranja `kraft` (papelão) é identidade, usado com parcimônia.

## Conteúdo e voz

- Português do Brasil, tratando por **você**. Frases curtas, voz ativa, sem exclamação e sem emoji.
- Sentence case em tudo: “Registrar encomenda”, não “Registrar Encomenda”. Caixa alta só no estilo `label`.
- Botões começam com verbo e dizem o resultado: “Registrar retirada”, “Salvar morador”, “Inativar porteiro”.
- Use o vocabulário do condomínio, sempre igual:
  - **Encomenda** (nunca “pedido” ou “pacote” na UI) · **Morador** · **Unidade** · **Bloco** ou **Quadra** (conforme o tipo do condomínio) · **Apto** ou **Casa** · **Portaria** · **Porteiro** · **Responsável**.
  - Tipo da encomenda: Envelope, Caixa, Embalagem, Outros. Tamanho: Pequeno, Médio, Grande.
  - Status: **Pendente** (aguardando retirada) e **Retirada**.
- Unidade escrita no formato `Bloco B · Apto 204` (apartamentos) ou `Quadra 3 · Casa 12` (casas), sempre em `code` quando aparece como identificador.
- Datas relativas até ontem (“Chegou hoje às 14:32”, “Chegou ontem às 09:10”); depois disso `12/10 às 09:10`. Horário 24h.
- Telas vazias dizem o que aconteceu e o próximo passo: “Nenhuma encomenda pendente. Quando chegar uma, registre aqui.”
- Mensagens de erro dizem como resolver: “Informe a unidade do morador.” — não “Campo inválido”.

## Cor

- Fundo da página `background`; cards, tabelas e modais em `card`; áreas discretas e chips em `muted`.
- Texto em `foreground`; secundário (datas, hints) em `muted-foreground`. Os dois passam 4.5:1 em `background`, `card` e `muted` nos temas Claro e Escuro.
- Uma ação `primary` por tela — a que a tela existe para fazer. Texto sobre ela em `primary-foreground` (no tema Escuro é tinta escura, não branco). Hover em `primary-hover`.
- Ações de apoio em `secondary` com `secondary-foreground`, ou botão `ghost`.
- `kraft` é a cor de marca (caixa de papelão): logotipo, capa, ilustração, número de destaque no painel. Texto sobre ela em `kraft-foreground`. Não use `kraft` para status.
- Status de encomenda:
  - Pendente: fundo `pendente`, texto/ícone `pendente-foreground`, ícone de relógio.
  - Retirada: fundo `retirada`, texto/ícone `retirada-foreground`, ícone de check.
  - As duas cores diferem em matiz e em claridade, e sempre vêm com a palavra.
- `destructive` só para excluir, inativar e erros. Texto sobre ela em `destructive-foreground`.
- Bordas: `border` para divisórias e cards; `input` para o contorno de campos e checkboxes (≥3:1).

## Tipografia

- Três famílias, todas do Google Fonts: **Bricolage Grotesque** (`display`) para títulos, **Public Sans** (`sans`) para a interface, **JetBrains Mono** (`mono`) para códigos.
- `h1` no título da página, `h2` em card e modal, `display` só para números grandes do painel e telas vazias.
- `body` é o padrão; `body-strong` para nome do morador e remetente; `small` para datas e hints; `label` para rótulos de campo, cabeçalho de tabela e badges.
- `code` para tudo que o porteiro confere caractere a caractere: unidade, nº da encomenda, matrícula, código de rastreio. Algarismos mono evitam confundir 1/l e 0/O.

## Espaço, forma e profundidade

- Grade de 4px: `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-6` 24 · `space-8` 32 · `space-12` 48.
- Card com padding `space-4` no celular e `space-6` a partir do tablet; `space-6` entre cards; `space-8` entre seções.
- Raios: `radius-sm` em badges e chips, `radius-md` em botões e inputs, `radius-lg` em cards, modais e na foto da encomenda, `radius-full` em avatar e no ponto de status.
- Cards em repouso: `border` + `shadow-sm`. Modal, popover e drawer: `shadow-md`. Nada de sombra colorida.
- Alturas de controle: `control-md` (44px) por padrão; `control-sm` (36px) em tabelas densas no desktop; `control-lg` (52px) na ação final do fluxo de retirada no tablet.

## Estados e interação

- Foco do teclado: anel sólido de 2px em `ring` com 2px de folga na cor do fundo (`box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--ring)`). Visível em todos os temas e superfícies.
- Desabilitado: 50% de opacidade e `cursor: not-allowed`; nunca esconda a ação — explique por que está desabilitada.
- Hover só muda cor de fundo (`primary-hover`, `muted`); sem crescer, sem pular.
- Transições de 120–160ms em cor e sombra. Nada de animação decorativa.

## Iconografia

- Ícones da biblioteca **Lucide** (`lucide-react`, já usada pelo shadcn/ui), traço 1.75px, 16px em linha de texto e 20px em botões.
- Ícones de referência: `Package` (encomenda / caixa), `Mail` (envelope), `PackageOpen` (embalagem), `Clock` (Pendente), `PackageCheck` ou `Check` (Retirada), `Camera` (foto), `PenLine` (assinatura), `Building2` (bloco), `Home` (casa).
- Ícone sempre acompanha texto em botões; ícone sozinho só com `aria-label`.

## Logotipo

- O símbolo é um **“i” cujo pingo é uma caixa de papelão**, sobre um ladrilho `primary` (#0e5a50) com cantos de 22% (14/64). A haste é creme (#f6f4ef); a caixa usa três tons de `kraft` (#e2a95a topo, #c9822b frente, #9f601e lateral) e a fita em #f2dab0.
- As cores do logotipo são **fixas**: não seguem o tema e não são trocadas por tokens. O ladrilho verde funciona sobre fundo claro e escuro.
- Assinatura horizontal: símbolo + **iPackage** em Bricolage Grotesque 700, com o “i” em `kraft` e o resto em `foreground`. Altura das maiúsculas = 56% da altura do símbolo; espaço entre os dois = 25% da altura do símbolo.
- No app, use sempre o componente `Wordmark` (`size="md"` na barra, `size="lg"` em Entrar e Crie sua senha) ou `LogoMark` sozinho, de `src/components/Logo.tsx`. Não redesenhe em CSS nem use o PNG dentro do app.
- Área de respiro mínima: 25% da altura do símbolo em volta. Tamanho mínimo: símbolo com 16 px (favicon simplificado, sem fita) e assinatura com 24 px de altura.
- Não faça: trocar as cores, girar ou distorcer, tirar o ladrilho do símbolo sobre fundo colorido, aplicar sombra ou contorno, escrever “IPackage” ou “Ipackage”.
- Arquivos em `brand/`: `logo.svg` (fundo claro), `logo-dark.svg` (fundo escuro), `mark.svg` (símbolo), `favicon.svg` (16–32 px), `og-image.svg`, e PNGs (`logo.png`, `logo-dark.png`, `mark-512.png`). Os textos dos SVGs estão convertidos em curvas, então não dependem da fonte instalada.
- Ícones do app em `public/`: `favicon.ico`, `favicon.svg`, `apple-touch-icon.png` (180, sem cantos: o iOS arredonda), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (PWA), `og-image.png` (1200×630, compartilhamento de link) e `site.webmanifest`.

## Layout

- Mobile/tablet primeiro. A tela da portaria tem uma lista de encomendas pendentes, filtro por unidade/morador no topo e o botão “Registrar encomenda” fixo.
- No desktop (síndico/administrador): menu lateral em `card`, conteúdo em `background`, largura máxima de 1200px.
- Tabelas viram lista de cards (`PackageCard`) abaixo de 768px.

## Uso com shadcn/ui + Tailwind

- Já integrado neste repositório: variáveis em `src/index.css` (`:root` claro e `.dark` escuro, triplets HSL no formato do shadcn) e cores, fontes, tamanhos de texto, raios, sombras e alturas em `tailwind.config.ts`.
- Classes do design system: `bg-primary`, `hover:bg-primary-hover`, `bg-kraft`, `bg-pendente text-pendente-foreground`, `bg-retirada text-retirada-foreground`, `font-display`, `font-mono`, `text-h1`, `text-h2`, `text-body`, `text-small`, `text-label`, `text-code`, `rounded-sm|md|lg`, `shadow-sm|md`, `h-control-sm|md|lg`.
- `--radius` do shadcn = `radius-md` (10px).
- Fontes carregadas do Google Fonts em `index.html`.

## Componentes

- `Button` — variantes `primary`, `secondary`, `ghost`, `destructive`; tamanhos `sm`, `md`, `lg`.
- `Input` — rótulo, dica e erro embutidos.
- `StatusBadge` — Pendente ou Retirada, com ícone e palavra.
- `PackageCard` — a encomenda na lista da portaria, com unidade, morador, tipo, tamanho, chegada e a ação de retirada.
- `AppBar` — topo de toda tela: marca, condomínio e porteiro logado com perfil e turno.
- `OptionGroup` — escolha única em botões de toque (tipo, tamanho, morador, quem retira).
- `SignaturePad` — assinatura com o dedo na retirada.
- `Icon` — ícones de traço embutidos para as telas.

## Telas da portaria

Os três fluxos do porteiro, montados só com os componentes acima, em layout de tablet (1024px):

- **Encomendas** (`TelaPendentes`) — abas Pendentes / Retiradas hoje, busca por unidade, morador ou nº, cards em grade de 3 colunas ordenados da mais antiga para a mais nova, e “Registrar encomenda” no topo.
- **Registrar encomenda** (`TelaNovaEncomenda`) — unidade digitada em `code` (B-204), moradores da unidade como opções, tipo, tamanho, remetente, observação e foto; à direita a prévia do card como vai aparecer na lista. O botão só habilita com unidade, morador, tipo, tamanho e remetente.
- **Registrar retirada** (`TelaRetirada`) — encomenda e foto da chegada à esquerda; à direita quem está retirando (destinatário, outro morador da unidade ou outra pessoa com nome e documento) e a assinatura. “Confirmar retirada” só habilita depois da assinatura.

Regras de tela:

- Uma ação `primary` por tela; Cancelar e voltar são `ghost`.
- Botão de concluir fica desabilitado até os campos obrigatórios estarem completos, e a tela diz o que falta.
- Depois de concluir, mostre o resultado no mesmo lugar (status atualizado + próximo passo), sem modal.
