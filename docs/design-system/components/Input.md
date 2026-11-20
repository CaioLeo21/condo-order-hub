# Input

Campo de texto com rótulo, dica e mensagem de erro embutidos, na altura de toque `control-md`.

- Sempre com `label` visível; placeholder só como exemplo de formato (“Ex.: Bloco B · 204”), nunca no lugar do rótulo.
- Use `mono` para unidade, matrícula, CPF e código de rastreio.
- `hint` explica o formato; `error` substitui a dica e diz como resolver (“Informe a unidade do morador.”).
- O consumidor fornece `value`/`onChange` (ou `defaultValue`), `name` e validação; o componente liga rótulo, dica e erro ao campo via `id` e `aria-describedby`.
