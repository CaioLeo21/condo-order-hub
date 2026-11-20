import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { findUnitByCodeIn, residentsOfUnitIn, unitsOfResidentIn, type PortariaData } from '@/contexts/dataTypes';
import { derivePermissions } from '@/hooks/usePermissions';
import { api } from '@/lib/api';
import type { NewPackage, PackageEdit, PackageView, PickupData } from '@/types/package';
import type { Resident, ResidentInput, ResidentUnit } from '@/types/resident';
import type { Unit, UnitKind } from '@/types/unit';
import type { User, UserInput } from '@/types/user';

// useData() ligado à API (orders-app), com TanStack Query. Mesmo formato do modo de exemplo.
// As chaves levam o condomínio: trocar de usuário nunca reaproveita dados de outro condomínio
// (e o AuthContext limpa o cache no login e no logout).

interface ResidentWithLinks extends Resident {
  links: ResidentUnit[];
}

interface PackagePage {
  items: PackageView[];
  total: number;
  page: number;
  pageSize: number;
}

const PAGE_SIZE = 200; // máximo aceito pela API

/** Todas as encomendas não excluídas do condomínio (pendentes e retiradas), página a página. */
async function fetchAllPackages(): Promise<PackageView[]> {
  const all: PackageView[] = [];
  for (let page = 1; ; page++) {
    const result = await api<PackagePage>('/packages', { query: { page, pageSize: PAGE_SIZE } });
    all.push(...result.items);
    if (result.items.length < PAGE_SIZE || all.length >= result.total) return all;
  }
}

const portariaKey = (condominiumId: string, resource: 'packages' | 'residents' | 'units' | 'users'): QueryKey => ['portaria', condominiumId, resource];

const EMPTY: never[] = [];

export function useApiData(): PortariaData {
  const queryClient = useQueryClient();
  const { user, condominium, refresh } = useAuth();
  const condominiumId = user?.condominiumId ?? '';
  const kind: UnitKind = condominium?.type ?? 'apartment';
  const enabled = Boolean(condominiumId) && !user?.mustChangePassword;
  const { canManageUsers } = derivePermissions(user?.profile);

  const keys = useMemo(
    () => ({
      packages: portariaKey(condominiumId, 'packages'),
      residents: portariaKey(condominiumId, 'residents'),
      units: portariaKey(condominiumId, 'units'),
      users: portariaKey(condominiumId, 'users'),
    }),
    [condominiumId],
  );

  // Encomendas mudam o tempo todo (outros porteiros registram e entregam): atualiza a cada minuto.
  const packagesQuery = useQuery({ queryKey: keys.packages, queryFn: fetchAllPackages, enabled, refetchInterval: 60_000 });
  const residentsQuery = useQuery({ queryKey: keys.residents, queryFn: () => api<ResidentWithLinks[]>('/residents'), enabled });
  const unitsQuery = useQuery({ queryKey: keys.units, queryFn: () => api<Unit[]>('/units'), enabled });
  const usersQuery = useQuery({ queryKey: keys.users, queryFn: () => api<User[]>('/users'), enabled: enabled && canManageUsers });

  const packages = packagesQuery.data ?? EMPTY;
  const units = unitsQuery.data ?? EMPTY;
  const users = usersQuery.data ?? EMPTY;
  const residentsWithLinks = residentsQuery.data ?? EMPTY;

  const residents: Resident[] = useMemo(
    () => residentsWithLinks.map(({ links: _links, ...resident }) => resident),
    [residentsWithLinks],
  );
  const links: ResidentUnit[] = useMemo(() => residentsWithLinks.flatMap((r) => r.links), [residentsWithLinks]);

  const getUnit = useCallback((id: string) => units.find((u) => u.id === id), [units]);
  const unitsOfResident = useCallback((residentId: string) => unitsOfResidentIn(links, units, residentId), [links, units]);
  const residentsOfUnit = useCallback((unitId: string) => residentsOfUnitIn(links, residents, unitId), [links, residents]);
  const findUnitByCode = useCallback((query: string) => findUnitByCodeIn(units, query), [units]);

  const invalidate = useCallback(
    (...which: (keyof typeof keys)[]) => Promise.all(which.map((k) => queryClient.invalidateQueries({ queryKey: keys[k] }))),
    [queryClient, keys],
  );

  /** Troca (ou tira, com null) uma encomenda no cache sem esperar a próxima leitura. */
  const putPackage = useCallback(
    (id: string, view: PackageView | null) => {
      queryClient.setQueryData<PackageView[]>(keys.packages, (old = []) => {
        const rest = old.filter((p) => p.id !== id);
        return view ? [view, ...rest] : rest;
      });
    },
    [queryClient, keys],
  );

  /** Roda a escrita; se der erro (ex.: outro porteiro já entregou), relê a lista para a tela não ficar desatualizada. */
  const withRefetchOnError = useCallback(
    async <T,>(run: () => Promise<T>, ...which: (keyof typeof keys)[]): Promise<T> => {
      try {
        return await run();
      } catch (error) {
        void invalidate(...which);
        throw error;
      }
    },
    [invalidate],
  );

  // ---------- Encomendas ----------

  const addPackage = useCallback(
    (data: NewPackage) =>
      withRefetchOnError(async () => {
        const view = await api<PackageView>('/packages', { body: data });
        putPackage(view.id, view);
        return view.id;
      }, 'residents'),
    [withRefetchOnError, putPackage],
  );

  const updatePackage = useCallback(
    (id: string, patch: PackageEdit) =>
      withRefetchOnError(async () => {
        // Na API, campo ausente = não mexe; "" = limpa. O front usa undefined para limpar.
        const body: PackageEdit = { ...patch };
        if ('trackingCode' in patch) body.trackingCode = patch.trackingCode ?? '';
        if ('notes' in patch) body.notes = patch.notes ?? '';
        putPackage(id, await api<PackageView>(`/packages/${id}`, { method: 'PATCH', body }));
      }, 'packages'),
    [withRefetchOnError, putPackage],
  );

  const deletePackage = useCallback(
    (id: string, reason: string) =>
      withRefetchOnError(async () => {
        await api(`/packages/${id}`, { method: 'DELETE', body: { reason } });
        putPackage(id, null);
      }, 'packages'),
    [withRefetchOnError, putPackage],
  );

  const registerPickup = useCallback(
    (id: string, data: PickupData) =>
      withRefetchOnError(async () => {
        putPackage(id, await api<PackageView>(`/packages/${id}/pickup`, { body: data }));
      }, 'packages'),
    [withRefetchOnError, putPackage],
  );

  // ---------- Moradores ----------

  const saveResident = useCallback(
    async (id: string | null, data: ResidentInput) => {
      await api(id ? `/residents/${id}` : '/residents', { method: id ? 'PUT' : 'POST', body: data });
      // Unidades novas podem ter nascido; o nome do destinatário aparece nas encomendas.
      await invalidate('residents', 'units', 'packages');
    },
    [invalidate],
  );

  const setResidentStatus = useCallback(
    async (id: string, status: Resident['status']) => {
      await api(`/residents/${id}/status`, { method: 'PATCH', body: { status } });
      await invalidate('residents');
    },
    [invalidate],
  );

  const deleteResident = useCallback(
    async (id: string) => {
      await api(`/residents/${id}`, { method: 'DELETE' });
      await invalidate('residents');
    },
    [invalidate],
  );

  // ---------- Usuários ----------

  const addUser = useCallback(
    async (data: UserInput) => {
      const { user: created, temporaryPassword } = await api<{ user: User; temporaryPassword: string }>('/users', { body: data });
      await invalidate('users');
      return { matricula: created.matricula, password: temporaryPassword };
    },
    [invalidate],
  );

  const updateUser = useCallback(
    async (matricula: string, data: UserInput) => {
      await api(`/users/${matricula}`, { method: 'PUT', body: data });
      // O nome aparece nas encomendas ("recebida por"); se for o próprio usuário, a sessão também muda.
      await invalidate('users', 'packages');
      if (matricula === user?.matricula) await refresh();
    },
    [invalidate, refresh, user?.matricula],
  );

  const setUserStatus = useCallback(
    async (matricula: string, status: User['status']) => {
      await api(`/users/${matricula}/status`, { method: 'PATCH', body: { status } });
      await invalidate('users');
    },
    [invalidate],
  );

  const resetUserPassword = useCallback(
    async (matricula: string) => {
      const { temporaryPassword } = await api<{ temporaryPassword: string }>(`/users/${matricula}/reset-password`, { method: 'POST' });
      await invalidate('users');
      return temporaryPassword;
    },
    [invalidate],
  );

  const isLoading =
    enabled && (packagesQuery.isPending || residentsQuery.isPending || unitsQuery.isPending || (canManageUsers && usersQuery.isPending));

  return {
    isLoading,
    unitKind: kind,
    units,
    residents,
    users,
    packages,
    getUnit,
    unitsOfResident,
    residentsOfUnit,
    findUnitByCode,
    addPackage,
    updatePackage,
    deletePackage,
    registerPickup,
    saveResident,
    setResidentStatus,
    deleteResident,
    addUser,
    updateUser,
    setUserStatus,
    resetUserPassword,
  };
}
