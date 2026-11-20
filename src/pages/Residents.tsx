import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { FilterTabs, type FilterTab } from "@/components/FilterTabs";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { errorMessage } from "@/lib/api";
import { ResidentCard } from "@/components/ResidentCard";
import { ResidentDialog } from "@/components/ResidentDialog";
import { useData } from "@/contexts/DataContext";
import { usePermissions } from "@/hooks/usePermissions";
import { formatUnit, normalizeText, unitCode } from "@/lib/format";
import type { Resident, ResidentInput } from "@/types/resident";

type StatusFilter = "active" | "inactive";

const Residents = () => {
  const { canManageResidents } = usePermissions();
  const { isLoading, residents, unitKind, unitsOfResident, saveResident, setResidentStatus, deleteResident } = useData();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialog, setDialog] = useState<{ mode: "new" } | { mode: "edit"; id: string } | null>(null);

  const visible = useMemo(() => {
    const q = normalizeText(searchTerm.trim());
    return residents
      .filter((r) => r.status === statusFilter)
      .filter((r) => {
        if (!q) return true;
        const units = unitsOfResident(r.id);
        return normalizeText([r.name, r.phone, ...units.map((u) => `${formatUnit(u)} ${unitCode(u)}`)].join(" ")).includes(q);
      })
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [residents, statusFilter, searchTerm, unitsOfResident]);

  const editing = dialog?.mode === "edit" ? residents.find((r) => r.id === dialog.id) : undefined;
  const activeCount = residents.filter((r) => r.status === "active").length;

  const tabs: FilterTab<StatusFilter>[] = [
    { key: "active", label: "Ativos", count: activeCount },
    { key: "inactive", label: "Inativos", count: residents.length - activeCount },
  ];

  const handleSave = async (data: ResidentInput) => {
    try {
      await saveResident(editing?.id ?? null, data);
      toast.success(editing ? "Morador atualizado." : "Morador cadastrado.");
      setDialog(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleToggle = async (r: Resident) => {
    const next = r.status === "active" ? "inactive" : "active";
    try {
      await setResidentStatus(r.id, next);
      toast.success(next === "inactive" ? `${r.name} foi inativado e não aparece mais na portaria.` : `${r.name} foi reativado.`);
      setDialog(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleDelete = async (r: Resident) => {
    try {
      await deleteResident(r.id);
      toast.success(`${r.name} foi excluído.`);
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
          title="Moradores"
          subtitle={`${activeCount} ${activeCount === 1 ? "morador ativo" : "moradores ativos"}`}
          actions={
            canManageResidents && (
              <Button onClick={() => setDialog({ mode: "new" })}>
                <Plus aria-hidden />
                Cadastrar morador
              </Button>
            )
          }
        />

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <FilterTabs tabs={tabs} active={statusFilter} onChange={setStatusFilter} />
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nome ou unidade" />
        </div>

        {isLoading ? (
          <LoadingState label="Carregando moradores…" />
        ) : visible.length === 0 ? (
          <EmptyState
            title={searchTerm ? "Nenhum morador encontrado" : statusFilter === "inactive" ? "Nenhum morador inativo" : "Nenhum morador cadastrado"}
            description={searchTerm ? "Confira o nome ou a unidade." : "Cadastre os moradores para registrar encomendas para eles."}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((resident) => (
              <ResidentCard key={resident.id} resident={resident} units={unitsOfResident(resident.id)} onOpen={(r) => setDialog({ mode: "edit", id: r.id })} />
            ))}
          </div>
        )}
      </main>

      {dialog && (
        <ResidentDialog
          key={dialog.mode === "edit" ? dialog.id : "new"}
          open
          onClose={() => setDialog(null)}
          resident={editing}
          units={editing ? unitsOfResident(editing.id) : []}
          unitKind={unitKind}
          canEdit={canManageResidents}
          onSave={handleSave}
          onToggleStatus={editing ? () => handleToggle(editing) : undefined}
          onDelete={editing ? () => handleDelete(editing) : undefined}
        />
      )}
    </div>
  );
};

export default Residents;
