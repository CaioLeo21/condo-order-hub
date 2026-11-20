# StatusBadge

Selo do status da encomenda — Pendente ou Retirada — sempre com ícone e palavra, nunca só cor.

- `status="pendente"`: fundo `pendente`, texto `pendente-foreground`, ícone de relógio.
- `status="retirada"`: fundo `retirada`, texto `retirada-foreground`, ícone de check.
- Fica no canto superior direito do `PackageCard` e na coluna Status das tabelas.
- Não crie outros status visuais sem antes acrescentar a regra de negócio; o produto tem só esses dois.
