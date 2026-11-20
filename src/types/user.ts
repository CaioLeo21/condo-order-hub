// Usuário do sistema (tabela Usuario do modelo): porteiro, responsável, administrador
// do condomínio ou dono do SaaS. A matrícula é a chave.
export type Shift = 'morning' | 'afternoon' | 'night';

/** doorman = Porteiro · manager = Responsável · admin = Administrador · owner = dono do iPackage */
export type Profile = 'doorman' | 'manager' | 'admin' | 'owner';

export interface User {
  matricula: string;
  name: string;
  profile: Profile;
  /** Turno — só para porteiros. */
  shift?: Shift;
  status: 'active' | 'inactive';
  /** null para o dono do SaaS, que não pertence a um condomínio. */
  condominiumId: string | null;
  /** Senha provisória ainda não trocada: força a troca no próximo login. */
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/** Só existe nos dados de exemplo; a API nunca devolve a senha. */
export interface StoredUser extends User {
  password: string;
}

export interface UserInput {
  name: string;
  profile: Profile;
  shift?: Shift;
}
