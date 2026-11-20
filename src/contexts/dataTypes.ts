import type { AdminCondominium, Condominium, CondominiumInput } from '@/types/condominium';
import type { Invoice, Plan, PlanInput } from '@/types/billing';
import type { NewPackage, PackageEdit, PackageView, PickupData } from '@/types/package';
import type { Resident, ResidentInput, ResidentUnit } from '@/types/resident';
import type { Unit, UnitKind } from '@/types/unit';
import type { User, UserInput } from '@/types/user';
import { normalizeUnitQuery, unitCode } from '@/lib/format';

// Formato dos hooks useData() e useAdminData(). As duas implementações (dados de exemplo e API)
// devolvem exatamente isto; as ações são assíncronas e lançam erro com mensagem pronta para exibir.

export interface ResidentOfUnit {
  resident: Resident;
  /** Id do vínculo Morador_Casa — é o que a encomenda guarda. */
  residentUnitId: string;
}

export interface PortariaData {
  /** Primeira carga ainda em andamento (só na API). */
  isLoading: boolean;
  unitKind: UnitKind;
  units: Unit[];
  /** Sem os excluídos; inclui os inativos. */
  residents: Resident[];
  /** Equipe do condomínio. Vazio para porteiros (a API só lista para responsável e administrador). */
  users: User[];
  packages: PackageView[];
  getUnit: (id: string) => Unit | undefined;
  unitsOfResident: (residentId: string) => Unit[];
  residentsOfUnit: (unitId: string) => ResidentOfUnit[];
  findUnitByCode: (query: string) => Unit | undefined;
  /** Devolve o id da encomenda criada (já presente em `packages`). */
  addPackage: (data: NewPackage) => Promise<string>;
  updatePackage: (id: string, patch: PackageEdit) => Promise<void>;
  deletePackage: (id: string, reason: string) => Promise<void>;
  registerPickup: (id: string, data: PickupData) => Promise<void>;
  saveResident: (id: string | null, data: ResidentInput) => Promise<void>;
  setResidentStatus: (id: string, status: Resident['status']) => Promise<void>;
  deleteResident: (id: string) => Promise<void>;
  addUser: (data: UserInput) => Promise<{ matricula: string; password: string }>;
  updateUser: (matricula: string, data: UserInput) => Promise<void>;
  setUserStatus: (matricula: string, status: User['status']) => Promise<void>;
  /** Devolve a nova senha provisória. */
  resetUserPassword: (matricula: string) => Promise<string>;
}

export interface AdminDataApi {
  isLoading: boolean;
  condominiums: AdminCondominium[];
  /** Ordenados por limite de unidades e início da vigência. */
  plans: Plan[];
  invoices: Invoice[];
  unitCount: (condominiumId: string) => number;
  currentPlan: (condominiumId: string) => Plan | undefined;
  suggestedPlan: (units: number) => Plan | undefined;
  isSlugTaken: (slug: string, exceptId?: string) => boolean;
  addCondominium: (input: CondominiumInput, adminName: string) => Promise<{ condominium: Condominium; matricula: string; password: string }>;
  updateCondominium: (id: string, input: CondominiumInput) => Promise<void>;
  setCondominiumStatus: (id: string, status: Condominium['status']) => Promise<void>;
  planInUse: (planId: string) => boolean;
  savePlan: (id: string | null, input: PlanInput) => Promise<void>;
  endPlan: (id: string) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  /** Quantas cobranças criou e quantos condomínios ficaram sem (nenhum plano vigente). */
  generateInvoices: (competence: string) => Promise<{ created: number; skipped: number }>;
  registerPayment: (id: string, amountPaid: number, paidAt: string) => Promise<void>;
  undoPayment: (id: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Consultas derivadas, iguais nas duas implementações
// ---------------------------------------------------------------------------

export function unitsOfResidentIn(links: ResidentUnit[], units: Unit[], residentId: string): Unit[] {
  return links
    .filter((ru) => ru.residentId === residentId && !ru.endedAt)
    .map((ru) => units.find((u) => u.id === ru.unitId))
    .filter((u): u is Unit => Boolean(u && !u.deletedAt));
}

/** Moradores ativos de uma unidade, com o id do vínculo. */
export function residentsOfUnitIn(links: ResidentUnit[], residents: Resident[], unitId: string): ResidentOfUnit[] {
  return links
    .filter((ru) => ru.unitId === unitId && !ru.endedAt)
    .map((ru) => ({ resident: residents.find((r) => r.id === ru.residentId), residentUnitId: ru.id }))
    .filter((x): x is ResidentOfUnit => Boolean(x.resident && x.resident.status === 'active' && !x.resident.deletedAt));
}

export function findUnitByCodeIn(units: Unit[], query: string): Unit | undefined {
  const q = normalizeUnitQuery(query);
  if (!q) return undefined;
  return units.find((u) => normalizeUnitQuery(unitCode(u)) === q);
}
