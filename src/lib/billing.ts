import { addMonths, format, parseISO } from 'date-fns';
import { todayYmd } from '@/lib/format';
import type { Invoice, InvoiceStatus, Plan } from '@/types/billing';

// Regras de plano e cobrança (RN-P1, RN-F2, RN-F3), iguais às da API.

/** Dia do mês em que a cobrança vence, no mês seguinte à competência. */
export const DUE_DAY = 10;

export type PlanStatus = 'active' | 'ended' | 'scheduled';

export function planStatus(plan: Plan, today = todayYmd()): PlanStatus {
  if (plan.validFrom > today) return 'scheduled';
  if (plan.validUntil && plan.validUntil < today) return 'ended';
  return 'active';
}

/** Vencimento: dia DUE_DAY do mês seguinte à competência ("2026-10" → "2026-11-10"). */
export function invoiceDueDate(competence: string): string {
  return format(addMonths(parseISO(`${competence}-01`), 1), `yyyy-MM-${String(DUE_DAY).padStart(2, '0')}`);
}

/** Usa o vencimento gravado pela API quando existe (dueDate); senão, calcula pela competência. */
export function invoiceStatus(invoice: Invoice, today = todayYmd()): InvoiceStatus {
  if (invoice.paidAt) return 'paid';
  return (invoice.dueDate ?? invoiceDueDate(invoice.competence)) < today ? 'overdue' : 'open';
}

/** Menor plano vigente que comporta o número de unidades (ou o maior, se nenhum comportar). */
export function suggestPlan(plans: Plan[], units: number): Plan | undefined {
  const active = [...plans].sort((a, b) => a.unitLimit - b.unitLimit).filter((p) => planStatus(p) === 'active');
  return active.find((p) => p.unitLimit >= units) ?? active.at(-1);
}
