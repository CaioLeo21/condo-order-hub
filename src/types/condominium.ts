import type { UnitKind } from './unit';

// Condomínio cliente (tabela Condominio do modelo).
export interface Condominium {
  id: string;
  name: string;
  /** tipo_condominio: define se a unidade é Bloco/Apto ou Quadra/Casa. */
  type: UnitKind;
  slug: string;
  status: 'active' | 'inactive';
  address?: string;
  createdAt: string;
  updatedAt: string;
}

/** Condomínio na lista do dono do iPackage (GET /admin/condominiums). */
export interface AdminCondominium extends Condominium {
  unitCount: number;
  /** Plano da cobrança mais recente; ausente se ainda não houve cobrança. */
  currentPlanId?: string;
}

export interface CondominiumInput {
  name: string;
  type: UnitKind;
  slug: string;
  address?: string;
}
