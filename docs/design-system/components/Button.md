# Button

Botão de ação em quatro variantes e três tamanhos, sempre com verbo no início.

- **primary** uma vez por tela, para a ação que a tela existe para fazer: “Registrar encomenda”, “Registrar retirada”, “Salvar morador”.
- **secondary** para ações de apoio ao lado da principal (“Tirar foto”, “Adicionar observação”).
- **ghost** para cancelar, voltar e ações de linha em tabela.
- **destructive** só para excluir ou inativar; peça confirmação antes.
- Tamanho `md` (44px) é o padrão na portaria; `sm` só em tabelas densas no desktop; `lg` na ação final do fluxo de retirada no tablet, com `block`.
- O consumidor fornece o texto (`children`), o `onClick` e, se quiser, um ícone Lucide de 20px em `icon`.
- Não use botão só com ícone sem `aria-label`.
