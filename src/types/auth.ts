import type { Condominium } from './condominium';
import type { User } from './user';

export type { Condominium } from './condominium';
export type { User } from './user';

export type LoginResult = 'ok' | 'invalid' | 'inactive' | 'condominium-inactive';

export interface AuthContextType {
  user: User | null;
  condominium: Condominium | null;
  /** Lança erro (com mensagem para exibir) em falhas que não são de credencial: rate limit, sem conexão. */
  login: (matricula: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  /** Troca a senha do usuário logado. Retorna false se a senha atual não confere; lança erro nos demais casos. */
  changePassword: (current: string, next: string) => Promise<boolean>;
  /** Relê o usuário e o condomínio da sessão (GET /me). Sem efeito nos dados de exemplo. */
  refresh: () => Promise<void>;
  isLoading: boolean;
}
