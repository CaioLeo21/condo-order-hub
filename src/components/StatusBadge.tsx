import { Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PACKAGE_STATUS_LABEL } from "@/lib/labels";
import type { PackageStatus } from "@/types/package";

interface StatusBadgeProps {
  status: PackageStatus;
  className?: string;
}

/** Status da encomenda — sempre ícone + palavra, nunca só cor. */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const Icon = status === "pending" ? Clock : Check;
  return (
    <Badge variant={status === "pending" ? "pendente" : "retirada"} className={className}>
      <Icon aria-hidden />
      {PACKAGE_STATUS_LABEL[status]}
    </Badge>
  );
}
