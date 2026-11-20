import { Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatUnit } from "@/lib/format";
import { residentTypeLabel } from "@/lib/labels";
import type { Resident } from "@/types/resident";
import type { Unit } from "@/types/unit";

interface ResidentCardProps {
  resident: Resident;
  units: Unit[];
  onOpen: (resident: Resident) => void;
}

export function ResidentCard({ resident, units, onOpen }: ResidentCardProps) {
  const [first, ...others] = units;
  return (
    <article
      tabIndex={0}
      onClick={() => onOpen(resident)}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(resident); }}
      aria-label={`${resident.name}, ${units.map(formatUnit).join(", ") || "sem unidade"}`}
      className="flex cursor-pointer flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate whitespace-nowrap font-mono text-code text-primary">
            {first ? formatUnit(first) : "Sem unidade"}
            {others.length > 0 && <span className="ml-2 text-muted-foreground">+{others.length}</span>}
          </div>
          <h3 className="mt-0.5 truncate font-display text-h2">{resident.name}</h3>
        </div>
        <Badge variant={resident.status === "active" ? "secondary" : "muted"} className="shrink-0">
          {resident.status === "active" ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="space-y-1 text-small text-muted-foreground">
        <div className="flex items-center gap-2">
          <Phone aria-hidden className="size-4 shrink-0" />
          <span>{resident.phone || "Sem telefone"}</span>
        </div>
        <div className="flex items-center gap-2">
          <User aria-hidden className="size-4 shrink-0" />
          <span>{residentTypeLabel(resident.residentType, resident.residentTypeDescription)}</span>
        </div>
        {others.length > 0 && <p className="font-mono text-xs">{others.map(formatUnit).join(" · ")}</p>}
      </div>
    </article>
  );
}
