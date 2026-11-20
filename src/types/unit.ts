// Unidade do condomínio (tabela Casa do modelo). Em prédios usa bloco + apartamento;
// em condomínios de casas usa quadra + casa (+ rua). Criada junto com o primeiro morador.
export type UnitKind = 'apartment' | 'house';

export interface Unit {
  id: string;
  condominiumId: string;
  kind: UnitKind;
  block?: string;
  apartment?: string;
  lot?: string;
  house?: string;
  street?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/** Unidade como digitada num formulário: bloco/quadra + número (+ rua em casas). */
export interface UnitInput {
  group?: string;
  number: string;
  street?: string;
}
