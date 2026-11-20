# PackageCard

A encomenda na lista da portaria: unidade, morador e status no topo, detalhes abaixo e a ação de retirada no rodapé.

- O consumidor fornece os dados já formatados: `unidade` (“Bloco B · Apto 204”), `morador`, `status`, e opcionalmente `tipo`, `tamanho`, `remetente`, `chegadaEm`, `recebidoPor`, `codigo`, `observacao`; para retiradas, `retiradaEm` e `retiradoPor`.
- Passe `onRegistrarRetirada` para mostrar o botão primary “Registrar retirada” (só aparece em pendentes). Ele abre o fluxo de foto/assinatura.
- Use em lista de uma coluna no celular e em grade de 2–3 colunas no tablet, com `space-6` entre cards.
- Ordene pendentes da mais antiga para a mais nova — a que está parada há mais tempo é a mais importante.
- Não coloque mais de uma ação primária no card; edição e exclusão vão num menu ghost.
