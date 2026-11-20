// Planos (tabela Precificacao) e cobranças (tabela Faturamento) do iPackage.
export interface Plan {
  id: string;
  /** descricao */
  description: string;
  /** limite_unidade */
  unitLimit: number;
  /** preco, em reais por mês */
  price: number;
  /** vigencia — início (YYYY-MM-DD). */
  validFrom: string;
  /** Fim da vigência (YYYY-MM-DD); vazio = vigente. */
  validUntil?: string;
}

export type PlanInput = Omit<Plan, 'id'>;

export interface Invoice {
  id: string;
  condominiumId: string;
  planId: string;
  /** competencia — "2026-10" */
  competence: string;
  /** valor_a_pagar */
  amountDue: number;
  /** valor_pago */
  amountPaid?: number;
  /** pago_em (YYYY-MM-DD) */
  paidAt?: string;
  /** vencimento (YYYY-MM-DD), gravado pela API na geração. Nos dados de exemplo é calculado. */
  dueDate?: string;
}

export type InvoiceStatus = 'open' | 'overdue' | 'paid';
