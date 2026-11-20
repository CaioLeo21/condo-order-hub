import { API_BASE } from '@/config';

// Cliente HTTP da API do iPackage (orders-app). Sessão em cookie HttpOnly (credentials: 'include').
// Erros chegam como { error: { code, message, details? } } com a mensagem pronta em pt-BR.

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** Mensagem por campo, quando a API devolve VALIDATION_ERROR (details.fields). */
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Códigos que significam "a sessão não vale mais" e levam de volta ao login. */
const SESSION_LOST = new Set(['UNAUTHENTICATED', 'USER_INACTIVE', 'CONDOMINIUM_INACTIVE']);

/** Disparado quando uma requisição mostra que a sessão caiu ou exige troca de senha. */
export const SESSION_EVENT = 'ipackage:session';
export type SessionEventDetail = { code: string; message: string };

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Envia multipart (uploads) em vez de JSON. */
  form?: FormData;
  query?: Record<string, string | number | undefined>;
  /** Não avisa o AuthContext em 401/403 de sessão (login e GET /me tratam sozinhos). */
  silentSession?: boolean;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = options.body !== undefined || options.form ? 'POST' : 'GET', body, form, query, silentSession } = options;
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  // X-Requested-With: proteção de CSRF exigida pela API em toda escrita (inclusive multipart).
  const headers: Record<string, string> = { Accept: 'application/json', 'X-Requested-With': 'ipackage' };
  let payload: BodyInit | undefined;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, { method, headers, body: payload, credentials: 'include' });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Sem conexão com o servidor. Confira a internet e tente de novo.');
  }

  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => undefined);

  if (!response.ok) {
    const error = (data as { error?: { code?: string; message?: string; details?: { fields?: Record<string, string> } } } | undefined)?.error;
    const apiError = new ApiError(
      response.status,
      error?.code ?? 'HTTP_ERROR',
      error?.message ?? 'Erro inesperado. Tente novamente em instantes.',
      error?.details?.fields,
    );
    if (!silentSession && (SESSION_LOST.has(apiError.code) || apiError.code === 'PASSWORD_CHANGE_REQUIRED')) {
      window.dispatchEvent(new CustomEvent<SessionEventDetail>(SESSION_EVENT, { detail: { code: apiError.code, message: apiError.message } }));
    }
    throw apiError;
  }
  return data as T;
}

export function isSessionLost(code: string) {
  return SESSION_LOST.has(code);
}

/** Mensagem para mostrar num toast, venha o erro da API ou de outro lugar. */
export function errorMessage(error: unknown, fallback = 'Não foi possível concluir. Tente de novo.'): string {
  if (error instanceof ApiError) {
    const firstField = error.fields ? Object.values(error.fields)[0] : undefined;
    return error.code === 'VALIDATION_ERROR' && firstField ? firstField : error.message;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
