import { Box, Check, Mail, PackageOpen, Ruler, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { formatWhen } from "@/lib/format";
import { PACKAGE_KIND_LABEL, PACKAGE_SIZE_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { PackageKind, PackageView } from "@/types/package";

const KIND_ICON: Record<PackageKind, LucideIcon> = {
  envelope: Mail,
  box: Box,
  bag: PackageOpen,
  other: Box,
};

interface PackageCardProps {
  package: PackageView;
  /** Abre os detalhes ao clicar no card. */
  onOpen?: (pkg: PackageView) => void;
  /** Mostra "Registrar retirada" quando a encomenda está pendente. */
  onRegisterPickup?: (pkg: PackageView) => void;
  className?: string;
}

/** A encomenda na lista da portaria: unidade, morador e status no topo; detalhes; ação de retirada. */
export function PackageCard({ package: pkg, onOpen, onRegisterPickup, className }: PackageCardProps) {
  const KindIcon = KIND_ICON[pkg.kind];
  const rows: [string, string][] = [["Remetente", pkg.senderCompany], ["Chegada", formatWhen(pkg.receivedAt)]];
  if (pkg.status === "pending") rows.push(["Recebida por", pkg.receivedByName]);
  if (pkg.status === "collected" && pkg.collectedAt) {
    rows.push(["Retirada", `${formatWhen(pkg.collectedAt)}${pkg.collectedBy ? ` · ${pkg.collectedBy}` : ""}`]);
  }
  if (pkg.notes) rows.push(["Obs.", pkg.notes]);

  const interactive = Boolean(onOpen);

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors sm:p-5",
        interactive && "cursor-pointer hover:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        className,
      )}
      onClick={interactive ? () => onOpen?.(pkg) : undefined}
      onKeyDown={interactive ? (e) => { if (e.key === "Enter") onOpen?.(pkg); } : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Encomenda ${pkg.code} para ${pkg.recipientName}, ${pkg.recipientUnit}` : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate whitespace-nowrap font-mono text-code text-primary">{pkg.recipientUnit}</div>
          <h3 className="mt-0.5 truncate font-display text-h2">{pkg.recipientName}</h3>
        </div>
        <StatusBadge status={pkg.status} className="shrink-0" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-6 items-center gap-1 rounded-sm bg-muted px-2 text-small">
          <KindIcon aria-hidden className="size-3.5 text-muted-foreground" />
          {PACKAGE_KIND_LABEL[pkg.kind]}
        </span>
        <span className="inline-flex h-6 items-center gap-1 rounded-sm bg-muted px-2 text-small">
          <Ruler aria-hidden className="size-3.5 text-muted-foreground" />
          {PACKAGE_SIZE_LABEL[pkg.size]}
        </span>
        <span className="font-mono text-small text-muted-foreground">{pkg.code}</span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-small">
        {rows.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="text-muted-foreground">{term}</dt>
            <dd className="min-w-0 truncate text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      {pkg.status === "pending" && onRegisterPickup && (
        <Button
          className="mt-auto w-full"
          onClick={(e) => {
            e.stopPropagation();
            onRegisterPickup(pkg);
          }}
        >
          <Check aria-hidden />
          Registrar retirada
        </Button>
      )}
    </article>
  );
}
