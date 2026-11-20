import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminDataApi } from '@/contexts/dataTypes';
import { api } from '@/lib/api';
import { suggestPlan } from '@/lib/billing';
import type { AdminCondominium, Condominium, CondominiumInput } from '@/types/condominium';
import type { Invoice, Plan, PlanInput } from '@/types/billing';

// useAdminData() ligado à API (rotas /admin/*, só para o perfil owner).

const keys = {
  condominiums: ['admin', 'condominiums'],
  plans: ['admin', 'plans'],
  invoices: ['admin', 'invoices'],
} as const;

type Resource = keyof typeof keys;

const EMPTY: never[] = [];

export function useApiAdminData(): AdminDataApi {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const enabled = user?.profile === 'owner' && !user.mustChangePassword;

  const condominiumsQuery = useQuery({ queryKey: keys.condominiums, queryFn: () => api<AdminCondominium[]>('/admin/condominiums'), enabled });
  const plansQuery = useQuery({ queryKey: keys.plans, queryFn: () => api<(Plan & { inUse: boolean })[]>('/admin/plans'), enabled });
  const invoicesQuery = useQuery({ queryKey: keys.invoices, queryFn: () => api<Invoice[]>('/admin/invoices'), enabled });

  const condominiums = condominiumsQuery.data ?? EMPTY;
  const plansWithUse = plansQuery.data ?? EMPTY;
  const invoices = invoicesQuery.data ?? EMPTY;

  const plans: Plan[] = useMemo(
    () => [...plansWithUse].sort((a, b) => a.unitLimit - b.unitLimit || a.validFrom.localeCompare(b.validFrom)),
    [plansWithUse],
  );

  const invalidate = useCallback(
    (...which: Resource[]) => Promise.all(which.map((k) => queryClient.invalidateQueries({ queryKey: keys[k] }))),
    [queryClient],
  );

  const unitCount = useCallback((id: string) => condominiums.find((c) => c.id === id)?.unitCount ?? 0, [condominiums]);
  const currentPlan = useCallback(
    (id: string) => {
      const planId = condominiums.find((c) => c.id === id)?.currentPlanId;
      return planId ? plans.find((p) => p.id === planId) : undefined;
    },
    [condominiums, plans],
  );
  const suggestedPlan = useCallback((units: number) => suggestPlan(plans, units), [plans]);
  // O owner vê todos os condomínios, então a lista basta para avisar no formulário; a API confere de novo (SLUG_TAKEN).
  const isSlugTaken = useCallback((slug: string, exceptId?: string) => condominiums.some((c) => c.slug === slug && c.id !== exceptId), [condominiums]);
  const planInUse = useCallback((planId: string) => plansWithUse.some((p) => p.id === planId && p.inUse), [plansWithUse]);

  // ---------- Condomínios ----------

  const addCondominium = useCallback(
    async (input: CondominiumInput, adminName: string) => {
      const result = await api<{ condominium: Condominium; admin: { matricula: string; name: string; temporaryPassword: string } }>(
        '/admin/condominiums',
        { body: { condominium: input, adminName } },
      );
      await invalidate('condominiums');
      return { condominium: result.condominium, matricula: result.admin.matricula, password: result.admin.temporaryPassword };
    },
    [invalidate],
  );

  const updateCondominium = useCallback(
    async (id: string, input: CondominiumInput) => {
      await api(`/admin/condominiums/${id}`, { method: 'PUT', body: input });
      await invalidate('condominiums');
    },
    [invalidate],
  );

  const setCondominiumStatus = useCallback(
    async (id: string, status: Condominium['status']) => {
      await api(`/admin/condominiums/${id}/status`, { method: 'PATCH', body: { status } });
      await invalidate('condominiums');
    },
    [invalidate],
  );

  // ---------- Planos ----------

  const savePlan = useCallback(
    async (id: string | null, input: PlanInput) => {
      await api(id ? `/admin/plans/${id}` : '/admin/plans', { method: id ? 'PUT' : 'POST', body: input });
      await invalidate('plans');
    },
    [invalidate],
  );

  const endPlan = useCallback(
    async (id: string) => {
      await api(`/admin/plans/${id}/end`, { method: 'POST' });
      await invalidate('plans');
    },
    [invalidate],
  );

  const deletePlan = useCallback(
    async (id: string) => {
      await api(`/admin/plans/${id}`, { method: 'DELETE' });
      await invalidate('plans');
    },
    [invalidate],
  );

  // ---------- Faturamento ----------

  const generateInvoices = useCallback(
    async (competence: string) => {
      const result = await api<{ created: number; skipped: unknown[] }>('/admin/invoices/generate', { body: { competence } });
      // Cobrança nova muda o plano atual do condomínio e trava o plano (inUse).
      await invalidate('invoices', 'condominiums', 'plans');
      return { created: result.created, skipped: result.skipped.length };
    },
    [invalidate],
  );

  const registerPayment = useCallback(
    async (id: string, amountPaid: number, paidAt: string) => {
      await api(`/admin/invoices/${id}/payment`, { body: { amountPaid, paidAt } });
      await invalidate('invoices');
    },
    [invalidate],
  );

  const undoPayment = useCallback(
    async (id: string) => {
      await api(`/admin/invoices/${id}/payment`, { method: 'DELETE' });
      await invalidate('invoices');
    },
    [invalidate],
  );

  return {
    isLoading: enabled && (condominiumsQuery.isPending || plansQuery.isPending || invoicesQuery.isPending),
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
