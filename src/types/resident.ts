import type { UnitInput } from './unit';

// Morador (tabela Morador do modelo). As unidades vêm do vínculo ResidentUnit.
export interface Resident {
  id: string;
  condominiumId: string;
  name: string;
  phone: string;
  residentType: 'owner' | 'tenant' | 'other';
  residentTypeDescription?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  /** Soft delete: some das listas, continua nas encomendas antigas. */
  deletedAt?: string;
}

/** Vínculo morador ↔ unidade (tabela Morador_Casa). Um morador pode ter várias unidades. */
export interface ResidentUnit {
  id: string;
  residentId: string;
  unitId: string;
  /** Vínculo encerrado (o morador saiu da unidade). Fica guardado porque encomendas antigas apontam para ele. */
  endedAt?: string;
}

export interface ResidentInput {
  name: string;
  phone: string;
  residentType: Resident['residentType'];
  residentTypeDescription?: string;
  units: UnitInput[];
}
