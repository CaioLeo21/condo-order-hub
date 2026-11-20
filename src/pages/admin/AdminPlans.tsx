import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { errorMessage } from "@/lib/api";
import { PlanDialog } from "@/components/admin/PlanDialog";
import { planStatus, useAdminData, type PlanStatus } from "@/contexts/AdminData";
import { formatBRL, formatDate } from "@/lib/format";
import { USE_MOCKS } from "@/config";
import type { Plan, PlanInput } from "@/types/billing";

const STATUS: Record<PlanStatus, { label: string; variant: "secondary" | "muted" | "pendente" }> = {
  active: { label: "Vigente", variant: "secondary" },
  scheduled: { label: "Futuro", variant: "pendente" },
  ended: { label: "Encerrado", variant: "muted" },
};

function validity(plan: Plan) {
  return plan.validUntil ? `${formatDate(plan.validFrom)} a ${formatDate(plan.validUntil)}` : `Desde ${formatDate(plan.validFrom)}`;
}

/** Planos do iPackage (tabela Precificacao). */
const AdminPlans = () => {
  const { isLoading, plans, condominiums, currentPlan, planInUse, savePlan, endPlan, deletePlan } = useAdminData();
  const [dialog, setDialog] = useState<{ mode: "new" } | { mode: "edit"; id: string } | null>(null);
  const [confirm, setConfirm] = useState<{ kind: "end" | "delete"; plan: Plan } | null>(null);

  const editing = dialog?.mode === "edit" ? plans.find((p) => p.id === dialog.id) : undefined;
  const activeCount = plans.filter((p) => planStatus(p) === "active").length;
  const condosOn = (planId: string) => condominiums.filter((c) => currentPlan(c.id)?.id === planId).length;

  const handleSave = async (input: PlanInput) => {
    try {
      await savePlan(editing?.id ?? null, input);
      toast.success(editing ? "Plano atualizado." : "Plano criado.");
      setDialog(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.kind === "end") {
        await endPlan(confirm.plan.id);
        toast.success(`${confirm.plan.description} encerrado.`);
      } else {
        await deletePlan(confirm.plan.id);
        toast.success(`${confirm.plan.description} excluído.`);
      }
    } catch (err) {
      toast.error(errorMessage(err));
    }
    setConfirm(null);
  };

  const ordered = [...plans].sort((a, b) => {
    const order: Record<PlanStatus, number> = { active: 0, scheduled: 1, ended: 2 };
    return order[planStatus(a)] - order[planStatus(b)] || a.unitLimit - b.unitLimit;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <PageHeader
          title="Planos"
          subtitle={`${activeCount} ${activeCount === 1 ? "plano vigente" : "planos vigentes"} · o condomínio entra no menor plano que comporta suas unidades`}
          actions={
            <Button onClick={() => setDialog({ mode: "new" })}>
              <Plus aria-hidden />
              Criar plano
            </Button>
          }
        />

        {isLoading ? (
          <LoadingState label="Carregando planos…" />
        ) : ordered.length === 0 ? (
          <EmptyState title="Nenhum plano criado" description="Crie os planos antes de gerar as cobranças dos condomínios." />
        ) : (
          <div className="rounded-lg border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-label uppercase">Plano</TableHead>
                  <TableHead className="text-right text-label uppercase">Até (unidades)</TableHead>
                  <TableHead className="text-right text-label uppercase">Preço/mês</TableHead>
                  <TableHead className="text-label uppercase">Vigência</TableHead>
                  <TableHead className="text-right text-label uppercase">Condomínios</TableHead>
                  <TableHead className="text-label uppercase">Situação</TableHead>
                  <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordered.map((p) => {
                  const status = planStatus(p);
                  const used = planInUse(p.id);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold text-body">{p.description}</TableCell>
                      <TableCell className="text-right font-mono text-code">{p.unitLimit}</TableCell>
                      <TableCell className="text-right font-mono text-code">{formatBRL(p.price)}</TableCell>
                      <TableCell className="whitespace-nowrap text-body">{validity(p)}</TableCell>
                      <TableCell className="text-right font-mono text-code">{condosOn(p.id)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS[status].variant}>{STATUS[status].label}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <Button variant="ghost" size="sm" onClick={() => setDialog({ mode: "edit", id: p.id })}>Editar</Button>
                        {status === "active" && (
                          <Button variant="ghost" size="sm" onClick={() => setConfirm({ kind: "end", plan: p })}>Encerrar</Button>
                        )}
                        {!used && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setConfirm({ kind: "delete", plan: p })}>
                            Excluir
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
        <p className="mt-3 text-small text-muted-foreground">Planos com cobranças não podem ser excluídos, só encerrados.{USE_MOCKS ? " Valores fictícios nos dados de exemplo." : ""}</p>
      </main>

      {dialog && (
        <PlanDialog
          key={dialog.mode === "edit" ? dialog.id : "new"}
          open
          onClose={() => setDialog(null)}
          plan={editing}
          inUse={editing ? planInUse(editing.id) : false}
          onSave={handleSave}
        />
      )}

      <AlertDialog open={Boolean(confirm)} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === "end" ? `Encerrar o plano ${confirm.plan.description}?` : `Excluir o plano ${confirm?.plan.description}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === "end"
                ? "A vigência termina hoje. As cobranças já geradas continuam; as próximas usam o plano vigente sugerido para cada condomínio."
                : "O plano nunca foi cobrado e sai da lista."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={confirm?.kind === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
              onClick={() => void handleConfirm()}
            >
              {confirm?.kind === "end" ? "Encerrar plano" : "Excluir plano"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPlans;
