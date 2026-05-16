import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  children: React.ReactNode;
  activeCount?: number;
}

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  onClear,
  children,
  activeCount = 0,
}: FilterModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-blue-600" />
            Filtros
            {activeCount > 0 && (
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 ml-1">
                {activeCount} {activeCount === 1 ? "ativo" : "ativos"}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">{children}</div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClear} className="flex-1 sm:flex-none">
            Limpar filtros
          </Button>
          <Button onClick={onApply} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700">
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
}

export function FilterField({ label, children }: FilterFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      {children}
    </div>
  );
}
