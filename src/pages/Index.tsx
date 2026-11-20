import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { FilterTabs, type FilterTab } from "@/components/FilterTabs";
import { SearchInput } from "@/components/SearchInput";
import { PackageCard } from "@/components/PackageCard";
import { PackageDetailsModal } from "@/components/PackageDetailsModal";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { useData } from "@/contexts/DataContext";
import { usePermissions } from "@/hooks/usePermissions";
import { daysSince, normalizeText, unitCode } from "@/lib/format";
import type { PackageStatus, PackageView } from "@/types/package";

type Period = "today" | "7d" | "30d" | "all";
const PERIOD_DAYS: Record<Period, number> = { today: 0, "7d": 6, "30d": 29, all: Infinity };

/** Tela "Encomendas" da portaria: pendentes (da mais antiga para a mais nova) e retiradas. */
const Index = () => {
  const navigate = useNavigate();
  const { canDeletePackages } = usePermissions();
  const { isLoading, packages, getUnit, updatePackage, deletePackage } = useData();
  const [tab, setTab] = useState<PackageStatus>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [period, setPeriod] = useState<Period>("7d");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pending = useMemo(
    () => packages.filter((p) => p.status === "pending").sort((a, b) => a.receivedAt.localeCompare(b.receivedAt)),
    [packages],
  );
  const collected = useMemo(
    () => packages.filter((p) => p.status === "collected").sort((a, b) => (b.collectedAt ?? "").localeCompare(a.collectedAt ?? "")),
    [packages],
  );

  const collectedInPeriod = useMemo(
    () => collected.filter((p) => p.collectedAt && daysSince(p.collectedAt) <= PERIOD_DAYS[period]),
    [collected, period],
  );

  const visible = useMemo(() => {
    const list = tab === "pending" ? pending : collectedInPeriod;
    const q = normalizeText(searchTerm.trim());
    if (!q) return list;
    return list.filter((p) => {
      const unit = getUnit(p.unitId);
      const haystack = normalizeText(
        [
          p.recipientUnit,
          unit ? unitCode(unit) : "",
          p.recipientName,
          p.code,
          p.trackingCode ?? "",
          p.senderCompany,
          p.receivedByName,
          p.deliveredByName ?? "",
          p.collectedBy ?? "",
        ].join(" "),
      );
      return haystack.includes(q);
    });
  }, [tab, pending, collectedInPeriod, searchTerm, getUnit]);

  const statusTabs: FilterTab<PackageStatus>[] = [
    { key: "pending", label: "Pendentes", count: pending.length },
    { key: "collected", label: "Retiradas", count: collected.length },
  ];
  const periodTabs: FilterTab<Period>[] = [
    { key: "today", label: "Hoje" },
    { key: "7d", label: "7 dias" },
    { key: "30d", label: "30 dias" },
    { key: "all", label: "Tudo" },
  ];

  const oldestDays = pending.length ? daysSince(pending[0].receivedAt) : 0;
  const subtitle = isLoading
    ? "Carregando…"
    : `${pending.length} ${pending.length === 1 ? "pendente" : "pendentes"}` +
    (oldestDays > 0 ? ` · a mais antiga chegou há ${oldestDays} ${oldestDays === 1 ? "dia" : "dias"}` : "");

  const selected = selectedId ? packages.find((p) => p.id === selectedId) ?? null : null;
  const goToPickup = (pkg: PackageView) => navigate(`/packages/${pkg.id}/pickup`);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <PageHeader
          title="Encomendas"
          subtitle={subtitle}
          actions={
            <Button onClick={() => navigate("/packages/new")}>
              <Plus aria-hidden />
              Registrar encomenda
            </Button>
          }
        />

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <FilterTabs tabs={statusTabs} active={tab} onChange={setTab} />
            {tab === "collected" && <FilterTabs tabs={periodTabs} active={period} onChange={setPeriod} />}
          </div>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={tab === "pending" ? "Buscar por unidade, morador ou nº" : "Buscar por unidade, morador ou porteiro"}
          />
        </div>

        {isLoading ? (
          <LoadingState label="Carregando encomendas…" />
        ) : visible.length === 0 ? (
          searchTerm ? (
            <EmptyState title="Nada encontrado" description="Confira a unidade ou o nome do morador." />
          ) : tab === "pending" ? (
            <EmptyState
              title="Nenhuma encomenda pendente"
              description="Quando chegar uma, registre aqui."
              action={
                <Button onClick={() => navigate("/packages/new")}>
                  <Plus aria-hidden />
                  Registrar encomenda
                </Button>
              }
            />
          ) : (
            <EmptyState
              title={period === "all" ? "Nenhuma retirada ainda" : "Nenhuma retirada no período"}
              description={period === "all" ? "As encomendas retiradas aparecem aqui com quem retirou e quando." : "Escolha um período maior para ver as retiradas mais antigas."}
            />
          )
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} onOpen={(p) => setSelectedId(p.id)} onRegisterPickup={goToPickup} />
            ))}
          </div>
        )}
      </main>

      {selected && (
        <PackageDetailsModal
          package={selected}
          isOpen={!!selected}
          onClose={() => setSelectedId(null)}
          onUpdate={updatePackage}
          onDelete={deletePackage}
          onRegisterPickup={goToPickup}
          canDelete={canDeletePackages}
        />
      )}
    </div>
  );
};

export default Index;
