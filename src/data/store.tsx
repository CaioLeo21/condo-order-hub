import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { USE_MOCKS } from '@/config';
import { createMockDb, MOCK_DB_VERSION, type MockDb } from '@/data/mockData';

// "Banco" de exemplo no navegador (só com VITE_USE_MOCKS=true). Guarda tudo no
// localStorage para os dados sobreviverem ao recarregar a página. Com a API
// (VITE_USE_MOCKS=false), os hooks em src/contexts usam src/lib/api.ts e este banco fica sem uso.
const STORAGE_KEY = 'ipackage-mock-db';

interface StoreContextType {
  db: MockDb;
  /** Aplica uma mudança no banco de exemplo. */
  update: (change: (db: MockDb) => MockDb) => void;
  /** Volta aos dados de exemplo originais. */
  reset: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function load(): MockDb {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as MockDb;
      if (parsed.version === MOCK_DB_VERSION) return parsed;
    }
  } catch {
    // Dados salvos inválidos: começa de novo.
  }
  return createMockDb();
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<MockDb>(load);

  useEffect(() => {
    if (!USE_MOCKS) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      // Sem espaço (fotos grandes): os dados continuam na memória até recarregar.
    }
  }, [db]);

  const update = useCallback((change: (db: MockDb) => MockDb) => setDb(change), []);
  const reset = useCallback(() => setDb(createMockDb()), []);

  return <StoreContext.Provider value={{ db, update, reset }}>{children}</StoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
}

/** Próximo id numérico (como um auto_increment). */
// eslint-disable-next-line react-refresh/only-export-components
export function nextId(items: { id: string }[]): string {
  return String(items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1);
}
