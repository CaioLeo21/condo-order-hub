import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Perfis que podem ver a rota. Sem ele, qualquer usuário logado. */
  profiles?: Profile[];
}

export function ProtectedRoute({ children, profiles }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) return null; // O App renderiza o Login.

  if (profiles && !profiles.includes(user.profile)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
