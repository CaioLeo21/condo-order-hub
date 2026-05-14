import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types/auth';

export interface Permissions {
  canManageResidents: boolean;
  canDeletePackages: boolean;
  canAccessDoormen: boolean;
}

function derivePermissions(role: User['role'] | undefined): Permissions {
  const isAdmin = role === 'admin';
  return {
    canManageResidents: isAdmin,
    canDeletePackages: isAdmin,
    canAccessDoormen: isAdmin,
  };
}

export function usePermissions(): Permissions {
  const { user } = useAuth();
  return derivePermissions(user?.role);
}
