// Rótulos de interface (PT-BR) — vocabulário do design system iPackage.
import type { PackageKind, PackageSize, PackageStatus } from '@/types/package';
import type { Profile, Shift } from '@/types/user';
import type { Resident } from '@/types/resident';
import type { InvoiceStatus } from '@/types/billing';
import type { UnitKind } from '@/types/unit';

export const PACKAGE_STATUS_LABEL: Record<PackageStatus, string> = {
  pending: 'Pendente',
  collected: 'Retirada',
};

export const PACKAGE_KIND_LABEL: Record<PackageKind, string> = {
  envelope: 'Envelope',
  box: 'Caixa',
  bag: 'Embalagem',
  other: 'Outros',
};

export const PACKAGE_SIZE_LABEL: Record<PackageSize, string> = {
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande',
};

export const PACKAGE_SIZE_HINT: Record<PackageSize, string> = {
  small: 'Cabe na mão',
  medium: 'Caixa de sapato',
  large: 'Precisa das duas mãos',
};

export const SHIFT_LABEL: Record<Shift, string> = {
  morning: 'Matutino',
  afternoon: 'Vespertino',
  night: 'Noturno',
};

export const PROFILE_LABEL: Record<Profile, string> = {
  doorman: 'Porteiro',
  manager: 'Responsável',
  admin: 'Administrador',
  owner: 'Administrador do iPackage',
};

export const PROFILE_HINT: Record<Exclude<Profile, 'owner'>, string> = {
  doorman: 'Registra encomendas e retiradas',
  manager: 'Também cuida de moradores e porteiros',
  admin: 'Acesso total ao condomínio',
};

export const CONDOMINIUM_TYPE_LABEL: Record<UnitKind, string> = {
  apartment: 'Prédio (bloco e apto)',
  house: 'Casas (quadra e casa)',
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  open: 'Em aberto',
  overdue: 'Atrasada',
  paid: 'Paga',
};

export const RESIDENT_TYPE_LABEL: Record<Resident['residentType'], string> = {
  owner: 'Proprietário',
  tenant: 'Inquilino',
  other: 'Outro',
};

export function residentTypeLabel(type: Resident['residentType'], description?: string) {
  if (type === 'other') return description || RESIDENT_TYPE_LABEL.other;
  return RESIDENT_TYPE_LABEL[type];
}
