// Configuração lida das variáveis de ambiente do Vite (.env.local).

/** Usa os dados de exemplo em vez da API. Padrão: true (sem backend). */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

/** URL base da API (orders-app), usada quando USE_MOCKS = false. Aceita com ou sem "/api/v1". */
export const API_URL = import.meta.env.VITE_API_URL ?? '';

/** Raiz das rotas da API, sempre terminando em "/api/v1" (ex.: http://localhost:3000/api/v1). */
export const API_BASE = (() => {
  const base = API_URL.trim().replace(/\/+$/, '');
  return base.endsWith('/api/v1') ? base : `${base}/api/v1`;
})();
