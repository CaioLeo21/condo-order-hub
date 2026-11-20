import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/FormField";
import { MoneyInput } from "@/components/MoneyInput";
import { todayYmd } from "@/lib/format";
import type { Plan, PlanInput } from "@/types/billing";

interface PlanDialogProps {
  open: boolean;
  onClose: () => void;
  plan?: Plan;
  /** Plano já cobrado: preço e limite ficam travados (crie um plano novo para mudar). */
  inUse?: boolean;
  onSave: (input: PlanInput) => Promise<void>;
}

/** Cadastro e edição de plano (tabela Precificacao). */
export function PlanDialog({ open, onClose, plan, inUse, onSave }: PlanDialogProps) {
  const [description, setDescription] = useState(plan?.description ?? "");
  const [unitLimit, setUnitLimit] = useState(plan ? String(plan.unitLimit) : "");
  const [price, setPrice] = useState(plan?.price ?? 0);
  const [validFrom, setValidFrom] = useState(plan?.validFrom ?? todayYmd());
  const [validUntil, setValidUntil] = useState(plan?.validUntil ?? "");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);

  const limit = Number(unitLimit);
  const errors = {
    description: tried && !description.trim() ? "Dê um nome ao plano." : undefined,
    unitLimit: tried && (!Number.isInteger(limit) || limit < 1) ? "Informe um número inteiro de unidades." : undefined,
    price: tried && price <= 0 ? "Informe o preço mensal." : undefined,
    validFrom: tried && !validFrom ? "Informe o início da vigência." : undefined,
    validUntil: validUntil && validFrom && validUntil < validFrom ? "O fim precisa ser depois do início." : undefined,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (busy || !description.trim() || !Number.isInteger(limit) || limit < 1 || price <= 0 || !validFrom || errors.validUntil) return;
    setBusy(true);
    void onSave({ description: description.trim(), unitLimit: limit, price, validFrom, validUntil: validUntil || undefined }).finally(() => setBusy(false));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-h2">{plan ? plan.description : "Criar plano"}</DialogTitle>
          <DialogDescription>
            {inUse ? "Este plano já tem cobranças: limite e preço não mudam. Para mudar valores, encerre este e crie outro." : "O plano vale para condomínios com até o limite de unidades."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5" noValidate>
          <FormField label="Nome do plano" htmlFor="plan-desc" error={errors.description}>
            <Input id="plan-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Essencial" aria-invalid={Boolean(errors.description) || undefined} />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Limite de unidades" htmlFor="plan-limit" error={errors.unitLimit}>
              <Input
                id="plan-limit"
                inputMode="numeric"
                className="font-mono text-code"
                value={unitLimit}
                disabled={inUse}
                onChange={(e) => setUnitLimit(e.target.value.replace(/\D/g, ""))}
                placeholder="50"
                aria-invalid={Boolean(errors.unitLimit) || undefined}
              />
            </FormField>
            <FormField label="Preço por mês" htmlFor="plan-price" error={errors.price}>
              <MoneyInput id="plan-price" value={price} onValueChange={setPrice} disabled={inUse} aria-invalid={Boolean(errors.price) || undefined} />
            </FormField>
            <FormField label="Vigência a partir de" htmlFor="plan-from" error={errors.validFrom}>
              <Input id="plan-from" type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
            </FormField>
            <FormField label="Até" htmlFor="plan-until" hint="Vazio = sem data para acabar." error={errors.validUntil}>
              <Input id="plan-until" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 border-t pt-5">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 aria-hidden className="animate-spin" /> : <Check aria-hidden />}
              {plan ? "Salvar" : "Criar plano"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
