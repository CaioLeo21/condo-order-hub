import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/types/user';

export interface Permissions {
  /** Dono do iPackage: só vê a área de administração (condomínios, planos, faturamento). */
  isOwner: boolean;
  /** Cadastrar, editar, inativar e excluir moradores. */
  canManageResidents: boolean;
  /** Excluir encomendas (com motivo). */
  canDeletePackages: boolean;
  /** Tela Usuários: cadastrar porteiros e responsáveis. */
  canManageUsers: boolean;
  /** Perfis que este usuário pode dar a outros. */
  assignableProfiles: Exclude<Profile, 'owner'>[];
}

export function derivePermissions(profile: Profile | undefined): Permissions {
  const manages = profile === 'manager' || profile === 'admin';
  return {
    isOwner: profile === 'owner',
    canManageResidents: manages,
    canDeletePackages: manages,
    canManageUsers: manages,
    assignableProfiles: profile === 'admin' ? ['doorman', 'manager', 'admin'] : profile === 'manager' ? ['doorman', 'manager'] : [],
  };
}

export function usePermissions(): Permissions {
  const { user } = useAuth();
  return derivePermissions(user?.profile);
}
