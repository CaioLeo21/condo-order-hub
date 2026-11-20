# SignaturePad

Área para quem retira a encomenda assinar com o dedo no tablet, com botão Limpar.

- O consumidor fornece `label` (“Assinatura de Mariana Souza”), `height` (padrão 180px) e `onChange(temAssinatura)` para liberar a confirmação.
- O traço usa a cor `foreground`, então funciona nos dois temas. Para salvar, pegue o `<canvas>` e exporte com `toDataURL()` ou `toBlob()` no seu código — o componente não faz upload.
- Mantenha o botão de confirmar desabilitado até `onChange(true)`.
- Não use para aceite de termos; é só a assinatura da retirada.
