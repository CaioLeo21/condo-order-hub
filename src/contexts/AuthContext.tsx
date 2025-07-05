
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Condominium, AuthContextType } from '@/types/auth';

// Mock data para diferentes condomínios
const mockCondominiums: Condominium[] = [
  {
    id: '1',
    name: 'Residencial Vista Verde',
    address: 'Rua das Flores, 123 - São Paulo/SP'
  },
  {
    id: '2', 
    name: 'Condomínio Solar do Bosque',
    address: 'Av. Principal, 456 - Rio de Janeiro/RJ'
  },
  {
    id: '3',
    name: 'Edifício Torre Azul',
    address: 'Rua Central, 789 - Belo Horizonte/MG'
  }
];

// Mock users para diferentes condomínios
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'admin@vistaverde.com',
    password: '123456',
    role: 'admin',
    condominiumId: '1'
  },
  {
    id: '2',
    name: 'Maria Santos', 
    email: 'porteiro@vistaverde.com',
    password: '123456',
    role: 'doorman',
    condominiumId: '1'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'admin@solarbosque.com', 
    password: '123456',
    role: 'admin',
    condominiumId: '2'
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'admin@torreazul.com',
    password: '123456', 
    role: 'admin',
    condominiumId: '3'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [condominium, setCondominium] = useState<Condominium | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const savedUser = localStorage.getItem('user');
    const savedCondominium = localStorage.getItem('condominium');
    
    if (savedUser && savedCondominium) {
      setUser(JSON.parse(savedUser));
      setCondominium(JSON.parse(savedCondominium));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        condominiumId: foundUser.condominiumId
      };
      
      const condominiumData = mockCondominiums.find(c => c.id === foundUser.condominiumId);
      
      setUser(userData);
      setCondominium(condominiumData || null);
      
      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('condominium', JSON.stringify(condominiumData));
      
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setCondominium(null);
    localStorage.removeItem('user');
    localStorage.removeItem('condominium');
  };

  return (
    <AuthContext.Provider value={{
      user,
      condominium,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
