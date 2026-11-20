import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { USE_MOCKS } from '@/config';
import { useStore } from '@/data/store';
import { api, ApiError, SESSION_EVENT, type SessionEventDetail } from '@/lib/api';
import type { AuthContextType, LoginResult } from '@/types/auth';
import type { Condominium } from '@/types/condominium';
import type { User } from '@/types/user';

// Login por matrícula + senha (tabela Usuario).
// - Dados de exemplo (VITE_USE_MOCKS=true): confere contra o banco local do navegador.
// - API: POST /auth/login grava o cookie de sessão; GET /me restaura a sessão ao recarregar.

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Dados de exemplo
// ---------------------------------------------------------------------------

const SESSION_KEY = 'ipackage-session';

function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const { db, update } = useStore();
  const [matricula, setMatricula] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      setMatricula(localStorage.getItem(SESSION_KEY));
    } catch {
      setMatricula(null);
    }
    setIsLoading(false);
  }, []);

  // O usuário vem sempre do banco: uma edição (nome, perfil, inativação) vale na hora.
  const stored = matricula ? db.users.find((u) => u.matricula === matricula && !u.deletedAt) : undefined;
  const user: User | null = useMemo(() => {
    if (!stored || stored.status !== 'active') return null;
    const { password: _password, ...rest } = stored;
    return rest;
  }, [stored]);
  const condominium = user?.condominiumId ? db.condominiums.find((c) => c.id === user.condominiumId) ?? null : null;

  const login = async (id: string, password: string): Promise<LoginResult> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const found = db.users.find((u) => u.matricula === id.trim() && !u.deletedAt);
    if (!found || found.password !== password) return 'invalid';
    if (found.status !== 'active') return 'inactive';
    if (found.condominiumId) {
      const condo = db.condominiums.find((c) => c.id === found.condominiumId);
      if (!condo || condo.status !== 'active') return 'condominium-inactive';
    }
    setMatricula(found.matricula);
    try {
      localStorage.setItem(SESSION_KEY, found.matricula);
    } catch {
      // Sessão só na memória.
    }
    return 'ok';
  };

  const logout = async () => {
    setMatricula(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // nada a fazer
    }
  };

  const changePassword = async (current: string, next: string) => {
    if (!stored || stored.password !== current) return false;
    const now = new Date().toISOString();
    update((d) => ({
      ...d,
      users: d.users.map((u) => (u.matricula === stored.matricula ? { ...u, password: next, mustChangePassword: false, updatedAt: now } : u)),
    }));
    return true;
  };

  const refresh = async () => {};

  return (
    <AuthContext.Provider value={{ user, condominium, login, logout, changePassword, refresh, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

interface Session {
  user: User;
  /** Omitido para o owner. */
  condominium?: Condominium;
}

const LOGIN_ERRORS: Record<string, LoginResult> = {
  INVALID_CREDENTIALS: 'invalid',
  USER_INACTIVE: 'inactive',
  CONDOMINIUM_INACTIVE: 'condominium-inactive',
};

function ApiAuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const endSession = useCallback(() => {
    setSession(null);
    queryClient.clear();
  }, [queryClient]);

  const refresh = useCallback(async () => {
    try {
      setSession(await api<Session>('/me', { silentSession: true }));
    } catch (error) {
      // Sem conexão: mantém o que já estava. Qualquer resposta de erro da API = sem sessão.
      if (!(error instanceof ApiError) || error.status !== 0) endSession();
    }
  }, [endSession]);

  // Restaura a sessão ao abrir a página.
  useEffect(() => {
    void refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  // Uma requisição qualquer descobriu que a sessão caiu (expirou, usuário ou condomínio inativado)
  // ou que a senha precisa ser trocada (senha resetada por um gestor).
  useEffect(() => {
    const onSession = (event: Event) => {
      const { code, message } = (event as CustomEvent<SessionEventDetail>).detail;
      if (code === 'PASSWORD_CHANGE_REQUIRED') {
        void refresh();
        return;
      }
      endSession();
      toast.error(message, { id: 'session-lost' });
    };
    window.addEventListener(SESSION_EVENT, onSession);
    return () => window.removeEventListener(SESSION_EVENT, onSession);
  }, [refresh, endSession]);

  const login = useCallback(
    async (matricula: string, password: string): Promise<LoginResult> => {
      try {
        const next = await api<Session>('/auth/login', { body: { matricula: matricula.trim(), password }, silentSession: true });
        queryClient.clear();
        setSession(next);
        return 'ok';
      } catch (error) {
        const mapped = error instanceof ApiError ? LOGIN_ERRORS[error.code] : undefined;
        if (mapped) return mapped;
        throw error; // TOO_MANY_ATTEMPTS, sem conexão… a tela mostra a mensagem.
      }
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST', silentSession: true });
    } catch {
      // O cookie expira sozinho; o importante é sair da tela.
    }
    endSession();
  }, [endSession]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      setSession(await api<Session>('/auth/change-password', { body: { currentPassword, newPassword }, silentSession: true }));
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.code === 'WRONG_PASSWORD') return false;
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user: session?.user ?? null,
      condominium: session?.condominium ?? null,
      login,
      logout,
      changePassword,
      refresh,
      isLoading,
    }),
    [session, login, logout, changePassword, refresh, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return USE_MOCKS ? <MockAuthProvider>{children}</MockAuthProvider> : <ApiAuthProvider>{children}</ApiAuthProvider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
