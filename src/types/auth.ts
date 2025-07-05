
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doorman';
  condominiumId: string;
}

export interface Condominium {
  id: string;
  name: string;
  address: string;
}

export interface AuthContextType {
  user: User | null;
  condominium: Condominium | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
