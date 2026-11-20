import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Check, FilePlus2, Loader2 } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { errorMessage } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { FilterTabs, type FilterTab } from "@/components/FilterTabs";
import { EmptyState } from "@/components/EmptyState";
import { FormField } from "@/components/FormField";
import { MoneyInput } from "@/components/MoneyInput";
import { invoiceDueDate, invoiceStatus, useAdminData } from "@/contexts/AdminData";
import { formatBRL, formatCompetence, formatDate, todayYmd } from "@/lib/format";
import { INVOICE_STATUS_LABEL } from "@/lib/labels";
import type { Invoice, InvoiceStatus } from "@/types/billing";

type StatusFilter = "all" | InvoiceStatus;

const BADGE: Record<InvoiceStatus, "muted" | "alerta" | "retirada"> = { open: "muted", overdue: "alerta", paid: "retirada" };

/** Registrar pagamento de uma cobrança: valor pago e data. */
function PaymentDialog({ invoice, title, onClose, onSave }: { invoice: Invoice; title: string; onClose: () => void; onSave: (amount: number, date: string) => Promise<void> }) {
  const [amount, setAmount] = useState(invoice.amountDue);
  const [date, setDate] = useState(todayYmd());
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-h2">Registrar pagamento</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (amount > 0 && date && !busy) {
              setBusy(true);
              void onSave(amount, date).finally(() => setBusy(false));
            }
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Valor pago" htmlFor="pay-amount" hint={amount !== invoice.amountDue ? `Cobrado: ${formatBRL(invoice.amountDue)}` : undefined}>
              <MoneyInput id="pay-amount" value={amount} onValueChange={setAmount} />
            </FormField>
            <FormField label="Pago em" htmlFor="pay-date">
              <Input id="pay-date" type="date" value={date} max={todayYmd()} onChange={(e) => setDate(e.target.value)} />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 border-t pt-5">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={amount <= 0 || !date || busy}>
              {busy ? <Loader2 aria-hidden className="animate-spin" /> : <Check aria-hidden />}
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Cobranças mensais dos condomínios (tabela Faturamento). */
const AdminBilling = () => {
  const { isLoading, invoices, condominiums, plans, generateInvoices, registerPayment, undoPayment } = useAdminData();
  const currentCompetence = format(new Date(), "yyyy-MM");
  const competences = useMemo(
    () => Array.from(new Set([currentCompetence, ...invoices.map((i) => i.competence)])).sort().reverse(),
    [invoices, currentCompetence],
  );
  const [competence, setCompetence] = useState(currentCompetence);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [paying, setPaying] = useState<Invoice | null>(null);

  const ofMonth = invoices.filter((i) => i.competence === competence);
  const count = (s: StatusFilter) => ofMonth.filter((i) => s === "all" || invoiceStatus(i) === s).length;
  const visible = ofMonth
    .filter((i) => statusFilter === "all" || invoiceStatus(i) === statusFilter)
    .sort((a, b) => {
      const order: Record<InvoiceStatus, number> = { overdue: 0, open: 1, paid: 2 };
      return order[invoiceStatus(a)] - order[invoiceStatus(b)];
    });

  const toReceive = ofMonth.filter((i) => !i.paidAt).reduce((sum, i) => sum + i.amountDue, 0);
  const received = ofMonth.reduce((sum, i) => sum + (i.amountPaid ?? 0), 0);
  const overdueAll = invoices.filter((i) => invoiceStatus(i) === "overdue");
  const missing = condominiums.filter((c) => c.status === "active" && !ofMonth.some((i) => i.condominiumId === c.id)).length;

  const condoName = (id: string) => condominiums.find((c) => c.id === id)?.name ?? "Condomínio removido";
  const planName = (id: string) => plans.find((p) => p.id === id)?.description ?? "—";

  const tabs: FilterTab<StatusFilter>[] = [
    { key: "all", label: "Todas", count: count("all") },
    { key: "open", label: "Em aberto", count: count("open") },
    { key: "overdue", label: "Atrasadas", count: count("overdue") },
    { key: "paid", label: "Pagas", count: count("paid") },
  ];

  const [generating, setGenerating] = useState(false);
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { created: n, skipped } = await generateInvoices(competence);
      toast.success(n ? `${n} ${n === 1 ? "cobrança gerada" : "cobranças geradas"} para ${formatCompetence(competence)}.` : "Todos os condomínios ativos já têm cobrança neste mês.");
      if (skipped) toast.warning(`${skipped} ${skipped === 1 ? "condomínio ficou" : "condomínios ficaram"} sem cobrança: não há plano vigente.`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleUndo = async (id: string) => {
    try {
      await undoPayment(id);
      toast.success("Pagamento desfeito.");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <PageHeader
          title="Faturamento"
          subtitle={
            <>
              {formatBRL(toReceive)} a receber · {formatBRL(received)} recebido em {formatCompetence(competence)}
              {overdueAll.length > 0 && <span className="text-destructive"> · {overdueAll.length} {overdueAll.length === 1 ? "cobrança atrasada" : "cobranças atrasadas"} no total</span>}
            </>
          }
          actions={
            <Button onClick={() => void handleGenerate()} disabled={missing === 0 || generating || isLoading}>
              {generating ? <Loader2 aria-hidden className="animate-spin" /> : <FilePlus2 aria-hidden />}
              Gerar cobranças do mês
            </Button>
          }
        />

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="overflow-x-auto">
            <FilterTabs tabs={tabs} active={statusFilter} onChange={setStatusFilter} />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="competence" className="text-label uppercase text-muted-foreground">Competência</label>
            <Select value={competence} onValueChange={setCompetence}>
              <SelectTrigger id="competence" className="h-control-md w-[200px] bg-card capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {competences.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">{formatCompetence(c)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {missing > 0 && ofMonth.length > 0 && (
          <p className="mb-4 text-small text-muted-foreground">
            {missing} {missing === 1 ? "condomínio ativo ainda não tem" : "condomínios ativos ainda não têm"} cobrança em {formatCompetence(competence)}.
          </p>
        )}

        {isLoading ? (
          <LoadingState label="Carregando cobranças…" />
        ) : visible.length === 0 ? (
          <EmptyState
            title={ofMonth.length === 0 ? `Nenhuma cobrança em ${formatCompetence(competence)}` : "Nenhuma cobrança nesta situação"}
            description={ofMonth.length === 0 ? "Gere as cobranças do mês: cada condomínio ativo recebe uma, no valor do plano dele." : "Escolha outra situação ou outro mês."}
            action={
              ofMonth.length === 0 && missing > 0 ? (
                <Button onClick={() => void handleGenerate()} disabled={generating}>
                  {generating ? <Loader2 aria-hidden className="animate-spin" /> : <FilePlus2 aria-hidden />}
                  Gerar cobranças do mês
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="rounded-lg border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-label uppercase">Condomínio</TableHead>
                  <TableHead className="text-label uppercase">Plano</TableHead>
                  <TableHead className="text-right text-label uppercase">Valor</TableHead>
                  <TableHead className="text-label uppercase">Vencimento</TableHead>
                  <TableHead className="text-label uppercase">Situação</TableHead>
                  <TableHead className="text-label uppercase">Pagamento</TableHead>
                  <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((inv) => {
                  const status = invoiceStatus(inv);
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-semibold text-body">{condoName(inv.condominiumId)}</TableCell>
                      <TableCell className="text-body">{planName(inv.planId)}</TableCell>
                      <TableCell className="text-right font-mono text-code">{formatBRL(inv.amountDue)}</TableCell>
                      <TableCell className="whitespace-nowrap text-body">{formatDate(inv.dueDate ?? invoiceDueDate(inv.competence))}</TableCell>
                      <TableCell>
                        <Badge variant={BADGE[status]}>{INVOICE_STATUS_LABEL[status]}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-body">
                        {inv.paidAt ? (
                          <>
                            <span className="font-mono text-code">{formatBRL(inv.amountPaid ?? 0)}</span>
                            <span className="text-muted-foreground"> em {formatDate(inv.paidAt)}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {inv.paidAt ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleUndo(inv.id)}
                          >
                            Desfazer
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm" onClick={() => setPaying(inv)}>
                            Registrar pagamento
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <p className="mt-3 text-small text-muted-foreground">Vencimento no dia 10 do mês seguinte à competência. Pagamentos são registrados à mão.</p>
      </main>

      {paying && (
        <PaymentDialog
          invoice={paying}
          title={`${condoName(paying.condominiumId)} · ${formatCompetence(paying.competence)} · ${formatBRL(paying.amountDue)}`}
          onClose={() => setPaying(null)}
          onSave={async (amount, date) => {
            try {
              await registerPayment(paying.id, amount, date);
              toast.success("Pagamento registrado.");
              setPaying(null);
            } catch (err) {
              toast.error(errorMessage(err));
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminBilling;
