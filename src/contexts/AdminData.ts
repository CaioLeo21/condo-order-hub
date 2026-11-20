import { useCallback, useMemo } from 'react';
import { USE_MOCKS } from '@/config';
import { useApiAdminData } from '@/contexts/apiAdminData';
import type { AdminDataApi } from '@/contexts/dataTypes';
import { nextId, useStore } from '@/data/store';
import { planStatus, suggestPlan } from '@/lib/billing';
import { generateTemporaryPassword, todayYmd } from '@/lib/format';
import type { AdminCondominium, Condominium, CondominiumInput } from '@/types/condominium';
import type { Invoice, Plan, PlanInput } from '@/types/billing';
import type { StoredUser } from '@/types/user';

// Dados da área do dono do iPackage: condomínios, planos (Precificacao) e cobranças (Faturamento).
// Mesmo padrão de useData(): banco de exemplo com VITE_USE_MOCKS=true, senão a API (apiAdminData.ts).

export { DUE_DAY, invoiceDueDate, invoiceStatus, planStatus, type PlanStatus } from '@/lib/billing';

function useMockAdminData(): AdminDataApi {
  const { db, update } = useStore();

  const plans = useMemo(() => [...db.plans].sort((a, b) => a.unitLimit - b.unitLimit || a.validFrom.localeCompare(b.validFrom)), [db.plans]);
  const invoices = db.invoices;

  const unitCount = useCallback((condominiumId: string) => db.units.filter((u) => u.condominiumId === condominiumId && !u.deletedAt).length, [db.units]);

  /** Plano da cobrança mais recente do condomínio. */
  const currentPlan = useCallback(
    (condominiumId: string): Plan | undefined => {
      const last = db.invoices.filter((i) => i.condominiumId === condominiumId).sort((a, b) => b.competence.localeCompare(a.competence))[0];
      return last ? db.plans.find((p) => p.id === last.planId) : undefined;
    },
    [db.invoices, db.plans],
  );

  const condominiums: AdminCondominium[] = useMemo(
    () => db.condominiums.map((c) => ({ ...c, unitCount: unitCount(c.id), currentPlanId: currentPlan(c.id)?.id })),
    [db.condominiums, unitCount, currentPlan],
  );

  const suggestedPlan = useCallback((units: number) => suggestPlan(plans, units), [plans]);

  // ---------- Condomínios ----------

  const isSlugTaken = useCallback((slug: string, exceptId?: string) => db.condominiums.some((c) => c.slug === slug && c.id !== exceptId), [db.condominiums]);

  /** Cria o condomínio e o primeiro administrador. Devolve a matrícula e a senha provisória. */
  const addCondominium = useCallback(
    async (input: CondominiumInput, adminName: string): Promise<{ condominium: Condominium; matricula: string; password: string }> => {
      const now = new Date().toISOString();
      const condominium: Condominium = { ...input, id: nextId(db.condominiums), status: 'active', createdAt: now, updatedAt: now };
      const matricula = String(db.users.reduce((max, u) => Math.max(max, Number(u.matricula) || 0), 0) + 1);
      const password = generateTemporaryPassword();
      const admin: StoredUser = {
        matricula,
        name: adminName.trim(),
        profile: 'admin',
        status: 'active',
        condominiumId: condominium.id,
        password,
        mustChangePassword: true,
        createdAt: now,
        updatedAt: now,
      };
      update((d) => ({ ...d, condominiums: [...d.condominiums, condominium], users: [...d.users, admin] }));
      return { condominium, matricula, password };
    },
    [db.condominiums, db.users, update],
  );

  const updateCondominium = useCallback(
    async (id: string, input: CondominiumInput) => {
      const now = new Date().toISOString();
      update((d) => ({ ...d, condominiums: d.condominiums.map((c) => (c.id === id ? { ...c, ...input, updatedAt: now } : c)) }));
    },
    [update],
  );

  const setCondominiumStatus = useCallback(
    async (id: string, status: Condominium['status']) => {
      const now = new Date().toISOString();
      update((d) => ({ ...d, condominiums: d.condominiums.map((c) => (c.id === id ? { ...c, status, updatedAt: now } : c)) }));
    },
    [update],
  );

  // ---------- Planos ----------

  const planInUse = useCallback((planId: string) => db.invoices.some((i) => i.planId === planId), [db.invoices]);

  const savePlan = useCallback(
    async (id: string | null, input: PlanInput) => {
      update((d) =>
        id
          ? { ...d, plans: d.plans.map((p) => (p.id === id ? { ...p, ...input } : p)) }
          : { ...d, plans: [...d.plans, { ...input, id: nextId(d.plans) }] },
      );
    },
    [update],
  );

  /** Encerra a vigência hoje. */
  const endPlan = useCallback(
    async (id: string) => {
      const today = todayYmd();
      update((d) => ({ ...d, plans: d.plans.map((p) => (p.id === id ? { ...p, validUntil: today } : p)) }));
    },
    [update],
  );

  /** Só para planos sem nenhuma cobrança. */
  const deletePlan = useCallback(
    async (id: string) => {
      update((d) => (d.invoices.some((i) => i.planId === id) ? d : { ...d, plans: d.plans.filter((p) => p.id !== id) }));
    },
    [update],
  );

  // ---------- Faturamento ----------

  /** Gera a cobrança da competência para cada condomínio ativo que ainda não tem. */
  const generateInvoices = useCallback(
    async (competence: string) => {
      const pending = db.condominiums.filter(
        (c) => c.status === 'active' && !db.invoices.some((i) => i.condominiumId === c.id && i.competence === competence),
      );
      const created: Invoice[] = [];
      let skipped = 0;
      let id = Number(nextId(db.invoices));
      for (const c of pending) {
        const current = currentPlan(c.id);
        const plan = current && planStatus(current) === 'active' ? current : suggestedPlan(unitCount(c.id));
        if (!plan) {
          skipped++;
          continue;
        }
        created.push({ id: String(id++), condominiumId: c.id, planId: plan.id, competence, amountDue: plan.price });
      }
      if (created.length) update((d) => ({ ...d, invoices: [...d.invoices, ...created] }));
      return { created: created.length, skipped };
    },
    [db.condominiums, db.invoices, currentPlan, suggestedPlan, unitCount, update],
  );

  const registerPayment = useCallback(
    async (id: string, amountPaid: number, paidAt: string) => {
      update((d) => ({ ...d, invoices: d.invoices.map((i) => (i.id === id ? { ...i, amountPaid, paidAt } : i)) }));
    },
    [update],
  );

  const undoPayment = useCallback(
    async (id: string) => {
      update((d) => ({ ...d, invoices: d.invoices.map((i) => (i.id === id ? { ...i, amountPaid: undefined, paidAt: undefined } : i)) }));
    },
    [update],
  );

  return {
    isLoading: false,
    condominiums,
    plans,
    invoices,
    unitCount,
    currentPlan,
    suggestedPlan,
    isSlugTaken,
    addCondominium,
    updateCondominium,
    setCondominiumStatus,
    planInUse,
    savePlan,
    endPlan,
    deletePlan,
    generateInvoices,
    registerPayment,
    undoPayment,
  };
}

/** Dados e ações da área do dono. A escolha entre exemplo e API é fixa no build (VITE_USE_MOCKS). */
export const useAdminData: () => AdminDataApi = USE_MOCKS ? useMockAdminData : useApiAdminData;
