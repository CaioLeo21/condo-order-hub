# OptionGroup

Escolha única entre poucas opções visíveis, em botões grandes de toque — substitui select e radio na portaria.

- Use para Tipo (4 opções), Tamanho (3), Morador da unidade e “Quem está retirando?”. Mais de 6 opções: use busca.
- O consumidor fornece `name`, `label`, `options` (`{ value, label, description?, icon? }`, ícones: `mail`, `box`, `user`…), `value` e `onChange(value)`. `columns` alinha em grade; sem ele, as opções quebram linha.
- Selecionada: fundo `secondary`, borda e check em `primary`. Setas do teclado mudam a seleção (`role="radiogroup"`).
- `description` explica a opção em uma linha (“Caixa de sapato”, “Inquilina”).
