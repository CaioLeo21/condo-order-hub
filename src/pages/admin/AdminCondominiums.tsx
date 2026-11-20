import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { errorMessage } from "@/lib/api";
import { TemporaryPasswordDialog } from "@/components/TemporaryPasswordDialog";
import { CondominiumDialog } from "@/components/admin/CondominiumDialog";
import { useAdminData } from "@/contexts/AdminData";
import { formatBRL, normalizeText } from "@/lib/format";
import type { Condominium, CondominiumInput } from "@/types/condominium";

const AdminCondominiums = () => {
  const { isLoading, condominiums, unitCount, currentPlan, suggestedPlan, isSlugTaken, addCondominium, updateCondominium, setCondominiumStatus } = useAdminData();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialog, setDialog] = useState<{ mode: "new" } | { mode: "edit"; id: string } | null>(null);
  const [credentials, setCredentials] = useState<{ title: string; name: string; matricula: string; password: string } | null>(null);

  const visible = useMemo(() => {
    const q = normalizeText(searchTerm.trim());
    return condominiums
      .filter((c) => !q || normalizeText(`${c.name} ${c.slug} ${c.address ?? ""}`).includes(q))
      .sort((a, b) => Number(b.status === "active") - Number(a.status === "active") || a.name.localeCompare(b.name, "pt-BR"));
  }, [condominiums, searchTerm]);

  const active = condominiums.filter((c) => c.status === "active");
  const totalUnits = active.reduce((sum, c) => sum + unitCount(c.id), 0);
  const editing = dialog?.mode === "edit" ? condominiums.find((c) => c.id === dialog.id) : undefined;

  const handleSave = async (input: CondominiumInput, adminName: string) => {
    try {
      if (editing) {
        await updateCondominium(editing.id, input);
        toast.success("Condomínio atualizado.");
        setDialog(null);
        return;
      }
      const { matricula, password } = await addCondominium(input, adminName);
      setDialog(null);
      setCredentials({ title: `${input.name} cadastrado`, name: adminName.trim(), matricula, password });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleToggle = async (c: Condominium) => {
    const next = c.status === "active" ? "inactive" : "active";
    try {
      await setCondominiumStatus(c.id, next);
      toast.success(next === "inactive" ? `${c.name} foi inativado.` : `${c.name} foi reativado.`);
      setDialog(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <PageHeader
          title="Condomínios"
          subtitle={`${active.length} ${active.length === 1 ? "ativo" : "ativos"} · ${totalUnits} unidades cadastradas`}
          actions={
            <Button onClick={() => setDialog({ mode: "new" })}>
              <Plus aria-hidden />
              Cadastrar condomínio
            </Button>
          }
        />

        <div className="mb-6">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nome ou identificador" />
        </div>

        {isLoading ? (
          <LoadingState label="Carregando condomínios…" />
        ) : visible.length === 0 ? (
          <EmptyState
            title={searchTerm ? "Nenhum condomínio encontrado" : "Nenhum condomínio cadastrado"}
            description={searchTerm ? "Confira o nome ou o identificador." : "Cadastre o primeiro cliente do iPackage."}
          />
        ) : (
          <div className="rounded-lg border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-label uppercase">Condomínio</TableHead>
                  <TableHead className="text-label uppercase">Tipo</TableHead>
                  <TableHead className="text-right text-label uppercase">Unidades</TableHead>
                  <TableHead className="text-label uppercase">Plano</TableHead>
                  <TableHead className="text-label uppercase">Situação</TableHead>
                  <TableHead><span className="sr-only">Ações</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((c) => {
                  const units = unitCount(c.id);
                  const plan = currentPlan(c.id);
                  const suggestion = suggestedPlan(units);
                  const overLimit = plan && units > plan.unitLimit;
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-semibold text-body">{c.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">{c.slug}</div>
                      </TableCell>
                      <TableCell className="text-body">{c.type === "house" ? "Casas" : "Prédio"}</TableCell>
                      <TableCell className="text-right font-mono text-code">{units}</TableCell>
                      <TableCell className="text-body">
                        {plan ? (
                          <>
                            <div>{plan.description} · {formatBRL(plan.price)}</div>
                            {overLimit && <div className="text-small font-medium text-destructive">Passou do limite de {plan.unitLimit} unidades</div>}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Sem cobrança ainda{suggestion ? ` · sugerido: ${suggestion.description}` : ""}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.status === "active" ? "secondary" : "muted"}>{c.status === "active" ? "Ativo" : "Inativo"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setDialog({ mode: "edit", id: c.id })} aria-label={`Editar ${c.name}`}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {dialog && (
        <CondominiumDialog
          key={dialog.mode === "edit" ? dialog.id : "new"}
          open
          onClose={() => setDialog(null)}
          condominium={editing}
          hasUnits={editing ? unitCount(editing.id) > 0 : false}
          isSlugTaken={isSlugTaken}
          onSave={handleSave}
          onToggleStatus={editing ? () => handleToggle(editing) : undefined}
        />
      )}

      {credentials && <TemporaryPasswordDialog open {...credentials} onClose={() => setCredentials(null)} />}
    </div>
  );
};

export default AdminCondominiums;
