import { useCallback, useMemo } from 'react';
import { USE_MOCKS } from '@/config';
import { useAuth } from '@/contexts/AuthContext';
import { useApiData } from '@/contexts/apiData';
import { findUnitByCodeIn, residentsOfUnitIn, unitsOfResidentIn, type PortariaData } from '@/contexts/dataTypes';
import { nextId, useStore } from '@/data/store';
import type { MockDb } from '@/data/mockData';
import { formatPackageCode, formatUnit, generateTemporaryPassword, unitGroup, unitNumber } from '@/lib/format';
import type { Unit, UnitInput, UnitKind } from '@/types/unit';
import type { Resident, ResidentInput } from '@/types/resident';
import type { StoredUser, User, UserInput } from '@/types/user';
import type { NewPackage, PackageEdit, PackageView, PickupData } from '@/types/package';

// Dados da portaria do condomínio logado (encomendas, moradores, unidades, usuários).
// Com VITE_USE_MOCKS=true, lê e grava no banco de exemplo (src/data/store.tsx);
// com a API, usa src/contexts/apiData.ts (TanStack Query). As duas têm o formato PortariaData.

export type { ResidentOfUnit } from '@/contexts/dataTypes';

/** Acha a unidade (mesmo bloco/quadra + número) ou cria uma nova. Devolve o banco e o id. */
function ensureUnit(db: MockDb, condominiumId: string, kind: UnitKind, input: UnitInput, now: string): [MockDb, string] {
  const group = input.group?.trim() || undefined;
  const number = input.number.trim();
  const same = (a?: string, b?: string) => (a ?? '').toLowerCase() === (b ?? '').toLowerCase();
  const existing = db.units.find(
    (u) => u.condominiumId === condominiumId && !u.deletedAt && same(unitNumber(u), number) && same(unitGroup(u), group),
  );
  if (existing) return [db, existing.id];
  const unit: Unit = {
    id: nextId(db.units),
    condominiumId,
    kind,
    ...(kind === 'house' ? { lot: group, house: number, street: input.street?.trim() || undefined } : { block: group, apartment: number }),
    createdAt: now,
    updatedAt: now,
  };
  return [{ ...db, units: [...db.units, unit] }, unit.id];
}

function useMockData(): PortariaData {
  const { db, update } = useStore();
  const { user, condominium } = useAuth();
  const condominiumId = user?.condominiumId ?? '';
  const kind: UnitKind = condominium?.type ?? 'apartment';

  const units = useMemo(() => db.units.filter((u) => u.condominiumId === condominiumId && !u.deletedAt), [db.units, condominiumId]);
  const residents = useMemo(() => db.residents.filter((r) => r.condominiumId === condominiumId && !r.deletedAt), [db.residents, condominiumId]);
  const users: User[] = useMemo(
    () =>
      db.users
        .filter((u) => u.condominiumId === condominiumId && !u.deletedAt)
        .map(({ password: _password, ...rest }) => rest),
    [db.users, condominiumId],
  );

  const getUnit = useCallback((id: string) => db.units.find((u) => u.id === id), [db.units]);
  const unitsOfResident = useCallback((residentId: string) => unitsOfResidentIn(db.residentUnits, db.units, residentId), [db.residentUnits, db.units]);
  const residentsOfUnit = useCallback((unitId: string) => residentsOfUnitIn(db.residentUnits, db.residents, unitId), [db.residentUnits, db.residents]);
  const findUnitByCode = useCallback((query: string) => findUnitByCodeIn(units, query), [units]);

  /** Encomendas do condomínio prontas para a tela (status, número e nomes resolvidos). */
  const packages: PackageView[] = useMemo(
    () =>
      db.packages
        .filter((p) => p.condominiumId === condominiumId && !p.deletedAt)
        .map((p) => {
          const link = db.residentUnits.find((ru) => ru.id === p.residentUnitId);
          const resident = db.residents.find((r) => r.id === link?.residentId);
          const unit = db.units.find((u) => u.id === link?.unitId);
          return {
            ...p,
            code: formatPackageCode(p.id),
            status: p.collectedAt ? 'collected' : 'pending',
            unitId: unit?.id ?? '',
            residentId: resident?.id ?? '',
            recipientName: resident?.name ?? 'Morador removido',
            recipientUnit: unit ? formatUnit(unit) : 'Unidade removida',
            receivedByName: db.users.find((u) => u.matricula === p.receivedBy)?.name ?? `Matrícula ${p.receivedBy}`,
            deliveredByName: p.deliveredBy ? db.users.find((u) => u.matricula === p.deliveredBy)?.name ?? `Matrícula ${p.deliveredBy}` : undefined,
          } satisfies PackageView;
        }),
    [db.packages, db.residentUnits, db.residents, db.units, db.users, condominiumId],
  );

  // ---------- Encomendas ----------

  const addPackage = useCallback(
    async (data: NewPackage): Promise<string> => {
      const now = new Date().toISOString();
      const id = nextId(db.packages);
      update((d) => ({
        ...d,
        packages: [
          { ...data, id, condominiumId, receivedAt: now, receivedBy: user?.matricula ?? '', createdAt: now, updatedAt: now },
          ...d.packages,
        ],
      }));
      return id;
    },
    [db.packages, update, condominiumId, user?.matricula],
  );

  const updatePackage = useCallback(
    async (id: string, patch: PackageEdit) => {
      const now = new Date().toISOString();
      update((d) => ({ ...d, packages: d.packages.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now } : p)) }));
    },
    [update],
  );

  /** Soft delete com motivo. */
  const deletePackage = useCallback(
    async (id: string, reason: string) => {
      const now = new Date().toISOString();
      update((d) => ({ ...d, packages: d.packages.map((p) => (p.id === id ? { ...p, deletedAt: now, deletionReason: reason, updatedAt: now } : p)) }));
    },
    [update],
  );

  const registerPickup = useCallback(
    async (id: string, data: PickupData) => {
      const now = new Date().toISOString();
      update((d) => ({
        ...d,
        packages: d.packages.map((p) => (p.id === id ? { ...p, ...data, collectedAt: now, deliveredBy: user?.matricula, updatedAt: now } : p)),
      }));
    },
    [update, user?.matricula],
  );

  // ---------- Moradores ----------

  const saveResident = useCallback(
    async (id: string | null, data: ResidentInput) => {
      const now = new Date().toISOString();
      update((d) => {
        let db2 = d;
        const unitIds: string[] = [];
        for (const input of data.units) {
          if (!input.number.trim()) continue;
          const [next, unitId] = ensureUnit(db2, condominiumId, kind, input, now);
          db2 = next;
          if (!unitIds.includes(unitId)) unitIds.push(unitId);
        }
        const fields = {
          name: data.name.trim(),
          phone: data.phone,
          residentType: data.residentType,
          residentTypeDescription: data.residentType === 'other' ? data.residentTypeDescription?.trim() || undefined : undefined,
        };
        let residentId = id;
        if (residentId) {
          db2 = { ...db2, residents: db2.residents.map((r) => (r.id === residentId ? { ...r, ...fields, updatedAt: now } : r)) };
        } else {
          residentId = nextId(db2.residents);
          db2 = { ...db2, residents: [...db2.residents, { ...fields, id: residentId, condominiumId, status: 'active', createdAt: now, updatedAt: now }] };
        }
        // Vínculos (Morador_Casa): reativa os que voltaram, cria os novos e encerra os removidos.
        // Um vínculo com encomendas é só encerrado (endedAt), nunca apagado: o histórico aponta para ele.
        let links = db2.residentUnits.map((ru) => {
          if (ru.residentId !== residentId) return ru;
          if (unitIds.includes(ru.unitId)) return ru.endedAt ? { ...ru, endedAt: undefined } : ru;
          return ru.endedAt ? ru : { ...ru, endedAt: now };
        });
        links = links.filter((ru) => !(ru.residentId === residentId && ru.endedAt === now && !db2.packages.some((p) => p.residentUnitId === ru.id)));
        for (const unitId of unitIds) {
          if (!links.some((ru) => ru.residentId === residentId && ru.unitId === unitId)) {
            links = [...links, { id: nextId(links), residentId: residentId!, unitId }];
          }
        }
        return { ...db2, residentUnits: links };
      });
    },
    [update, condominiumId, kind],
  );

  const setResidentStatus = useCallback(
    async (id: string, status: Resident['status']) => {
      const now = new Date().toISOString();
      update((d) => ({ ...d, residents: d.residents.map((r) => (r.id === id ? { ...r, status, updatedAt: now } : r)) }));
    },
    [update],
  );

  /** Soft delete: some das listas, continua nas encomendas antigas. */
  const deleteResident = useCallback(
    async (id: string) => {
      const now = new Date().toISOString();
      update((d) => ({ ...d, residents: d.residents.map((r) => (r.id === id ? { ...r, status: 'inactive', deletedAt: now, updatedAt: now } : r)) }));
    },
    [update],
  );

  // ---------- Usuários ----------

  /** Cria o usuário com senha provisória. Devolve matrícula e senha para mostrar uma vez. */
  const addUser = useCallback(
    async (data: UserInput): Promise<{ matricula: string; password: string }> => {
      const now = new Date().toISOString();
      const matricula = String(db.users.reduce((max, u) => Math.max(max, Number(u.matricula) || 0), 0) + 1);
      const password = generateTemporaryPassword();
      const created: StoredUser = {
        matricula,
        name: data.name.trim(),
        profile: data.profile,
        shift: data.profile === 'doorman' ? data.shift : undefined,
        status: 'active',
        condominiumId,
        password,
        mustChangePassword: true,
        createdAt: now,
        updatedAt: now,
      };
      update((d) => ({ ...d, users: [...d.users, created] }));
      return { matricula, password };
    },
    [db.users, update, condominiumId],
  );

  const updateUser = useCallback(
    async (matricula: string, data: UserInput) => {
      const now = new Date().toISOString();
      update((d) => ({
        ...d,
        users: d.users.map((u) =>
          u.matricula === matricula ? { ...u, name: data.name.trim(), profile: data.profile, shift: data.profile === 'doorman' ? data.shift : undefined, updatedAt: now } : u,
        ),
      }));
    },
    [update],
  );

  const setUserStatus = useCallback(
    async (matricula: string, status: User['status']) => {
      const now = new Date().toISOString();
      update((d) => ({ ...d, users: d.users.map((u) => (u.matricula === matricula ? { ...u, status, updatedAt: now } : u)) }));
    },
    [update],
  );

  /** Gera nova senha provisória (o usuário troca no próximo login). */
  const resetUserPassword = useCallback(
    async (matricula: string): Promise<string> => {
      const password = generateTemporaryPassword();
      const now = new Date().toISOString();
      update((d) => ({ ...d, users: d.users.map((u) => (u.matricula === matricula ? { ...u, password, mustChangePassword: true, updatedAt: now } : u)) }));
      return password;
    },
    [update],
  );

  return {
    isLoading: false,
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

/** Dados e ações da portaria. A escolha entre exemplo e API é fixa no build (VITE_USE_MOCKS). */
export const useData: () => PortariaData = USE_MOCKS ? useMockData : useApiData;
