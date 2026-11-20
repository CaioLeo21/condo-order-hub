// Encomenda (tabela Encomenda do modelo).
export type PackageStatus = 'pending' | 'collected';
export type PackageKind = 'envelope' | 'box' | 'bag' | 'other';
export type PackageSize = 'small' | 'medium' | 'large';

/** Como a encomenda é guardada (espelha as colunas do modelo). */
export interface Package {
  id: string;
  condominiumId: string;
  /** fk_id_morador_casa — morador + unidade de destino. */
  residentUnitId: string;
  senderCompany: string;
  trackingCode?: string;
  kind: PackageKind;
  size: PackageSize;
  notes?: string;
  /** link_foto */
  photoUrl?: string;
  /** data_chegada (ISO) */
  receivedAt: string;
  /** fk_usuario_matricula — porteiro que recebeu. */
  receivedBy: string;
  /** data_retirada (ISO). Preenchida = encomenda retirada. */
  collectedAt?: string;
  /** recebedor — quem retirou. */
  collectedBy?: string;
  collectedByDocument?: string;
  /** link_assinatura */
  signatureUrl?: string;
  /** Matrícula do porteiro que entregou (campo novo sugerido para o modelo). */
  deliveredBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletionReason?: string;
}

/** Encomenda pronta para a tela: com status, número e nomes resolvidos. */
export interface PackageView extends Package {
  /** "#000318" — o id formatado. */
  code: string;
  status: PackageStatus;
  unitId: string;
  residentId: string;
  recipientName: string;
  /** "Bloco B · Apto 204" */
  recipientUnit: string;
  receivedByName: string;
  deliveredByName?: string;
}

export interface NewPackage {
  residentUnitId: string;
  senderCompany: string;
  trackingCode?: string;
  kind: PackageKind;
  size: PackageSize;
  notes?: string;
  photoUrl?: string;
}

export type PackageEdit = Partial<Pick<Package, 'senderCompany' | 'trackingCode' | 'kind' | 'size' | 'notes'>>;

export interface PickupData {
  collectedBy: string;
  collectedByDocument?: string;
  signatureUrl: string;
}
