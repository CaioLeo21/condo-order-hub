import { useState } from "react";
import { Check, Loader2, Plus, Power, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FormField } from "@/components/FormField";
import { OptionGroup, type OptionGroupOption } from "@/components/OptionGroup";
import { formatUnit, groupingLabel, maskPhone, numberLabel, unitGroup, unitNumber } from "@/lib/format";
import { RESIDENT_TYPE_LABEL, residentTypeLabel } from "@/lib/labels";
import type { Resident, ResidentInput } from "@/types/resident";
import type { Unit, UnitInput, UnitKind } from "@/types/unit";

type ResidentType = Resident["residentType"];
const TYPE_OPTIONS: OptionGroupOption<ResidentType>[] = (["owner", "tenant", "other"] as const).map((t) => ({ value: t, label: RESIDENT_TYPE_LABEL[t] }));

interface ResidentDialogProps {
  open: boolean;
  onClose: () => void;
  /** Sem morador = cadastro. */
  resident?: Resident;
  units?: Unit[];
  unitKind: UnitKind;
  canEdit: boolean;
  onSave: (data: ResidentInput) => Promise<void>;
  onToggleStatus?: () => Promise<void>;
  onDelete?: () => Promise<void>;
}

const emptyUnit: UnitInput = { group: "", number: "", street: "" };

/** Cadastro, edição e detalhes do morador, com uma ou mais unidades (Morador_Casa). */
export function ResidentDialog({ open, onClose, resident, units = [], unitKind, canEdit, onSave, onToggleStatus, onDelete }: ResidentDialogProps) {
  const [name, setName] = useState(resident?.name ?? "");
  const [phone, setPhone] = useState(resident?.phone ?? "");
  const [type, setType] = useState<ResidentType | "">(resident?.residentType ?? "owner");
  const [typeDescription, setTypeDescription] = useState(resident?.residentTypeDescription ?? "");
  const [unitRows, setUnitRows] = useState<UnitInput[]>(
    units.length ? units.map((u) => ({ group: unitGroup(u) ?? "", number: unitNumber(u), street: u.street ?? "" })) : [{ ...emptyUnit }],
  );
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);

  /** Uma ação por vez: evita cadastro em dobro com clique repetido. */
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const isHouse = unitKind === "house";
  const filledUnits = unitRows.filter((u) => u.number.trim());
  const errors = {
    name: tried && !name.trim() ? "Informe o nome do morador." : undefined,
    phone: tried && phone && phone.replace(/\D/g, "").length < 10 ? "Telefone com DDD, ex.: (11) 99999-9999." : undefined,
    units: tried && filledUnits.length === 0 ? `Informe pelo menos uma unidade (${groupingLabel(unitKind).toLowerCase()} e número).` : undefined,
  };

  const setRow = (i: number, patch: Partial<UnitInput>) => setUnitRows((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!name.trim() || !type || filledUnits.length === 0 || errors.phone) return;
    void run(() => onSave({ name, phone, residentType: type, residentTypeDescription: typeDescription, units: filledUnits }));
  };

  if (!canEdit && resident) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-h2">{resident.name}</DialogTitle>
            <DialogDescription>{residentTypeLabel(resident.residentType, resident.residentTypeDescription)} · {resident.status === "active" ? "ativo" : "inativo"}</DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-body">
            <dt className="text-muted-foreground">Telefone</dt>
            <dd>{resident.phone || "—"}</dd>
            <dt className="text-muted-foreground">{units.length > 1 ? "Unidades" : "Unidade"}</dt>
            <dd className="font-mono text-code">{units.map((u) => <div key={u.id}>{formatUnit(u)}</div>)}</dd>
          </dl>
          <p className="text-small text-muted-foreground">Só o responsável ou o administrador altera moradores.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-h2">{resident ? resident.name : "Cadastrar morador"}</DialogTitle>
          <DialogDescription>
            {resident
              ? `${resident.status === "active" ? "Ativo" : "Inativo"} · ${units.length} ${units.length === 1 ? "unidade" : "unidades"}`
              : "A unidade é criada automaticamente se ainda não existir."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nome" htmlFor="res-name" error={errors.name}>
              <Input id="res-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" aria-invalid={Boolean(errors.name) || undefined} />
            </FormField>
            <FormField label="Telefone" htmlFor="res-phone" hint="Para avisos de encomenda no futuro." error={errors.phone}>
              <Input id="res-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(11) 99999-9999" aria-invalid={Boolean(errors.phone) || undefined} />
            </FormField>
          </div>

          <OptionGroup name="res-type" label="Tipo de morador" columns={3} options={TYPE_OPTIONS} value={type} onChange={setType} />
          {type === "other" && (
            <FormField label="Descrição" htmlFor="res-type-desc" hint="Ex.: Familiar, Funcionário.">
              <Input id="res-type-desc" value={typeDescription} onChange={(e) => setTypeDescription(e.target.value)} />
            </FormField>
          )}

          <fieldset className="space-y-2">
            <legend className="text-label uppercase text-muted-foreground">{filledUnits.length > 1 ? "Unidades" : "Unidade"}</legend>
            {unitRows.map((row, i) => (
              <div key={i} className={isHouse ? "grid grid-cols-[1fr_1fr_auto] items-end gap-2 sm:grid-cols-[1fr_1fr_1.4fr_auto]" : "grid grid-cols-[1fr_1fr_auto] items-end gap-2"}>
                <div className="space-y-1">
                  <label htmlFor={`unit-group-${i}`} className="text-small text-muted-foreground">{groupingLabel(unitKind)}</label>
                  <Input id={`unit-group-${i}`} className="font-mono text-code" value={row.group} onChange={(e) => setRow(i, { group: e.target.value })} placeholder={isHouse ? "3" : "B"} />
                </div>
                <div className="space-y-1">
                  <label htmlFor={`unit-number-${i}`} className="text-small text-muted-foreground">{numberLabel(unitKind)}</label>
                  <Input id={`unit-number-${i}`} className="font-mono text-code" value={row.number} onChange={(e) => setRow(i, { number: e.target.value })} placeholder={isHouse ? "12" : "204"} />
                </div>
                {isHouse ? (
                  <div className="col-span-2 space-y-1 sm:col-span-1">
                    <label htmlFor={`unit-street-${i}`} className="text-small text-muted-foreground">Rua (opcional)</label>
                    <Input id={`unit-street-${i}`} value={row.street} onChange={(e) => setRow(i, { street: e.target.value })} placeholder="Rua dos Ipês" />
                  </div>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover unidade ${i + 1}`}
                  disabled={unitRows.length === 1}
                  onClick={() => setUnitRows((rows) => rows.filter((_, j) => j !== i))}
                  className="row-start-1 col-start-3 self-end sm:row-auto sm:col-auto"
                >
                  <X />
                </Button>
              </div>
            ))}
            {errors.units && <p className="text-small font-medium text-destructive">{errors.units}</p>}
            <Button type="button" variant="ghost" size="sm" onClick={() => setUnitRows((rows) => [...rows, { ...emptyUnit }])}>
              <Plus aria-hidden />
              Adicionar unidade
            </Button>
          </fieldset>

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {resident && onToggleStatus && (
                <Button type="button" variant="ghost" disabled={busy} onClick={() => void run(onToggleStatus)}>
                  <Power aria-hidden />
                  {resident.status === "active" ? "Inativar" : "Reativar"}
                </Button>
              )}
              {resident && onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="ghost" disabled={busy} className="text-destructive hover:text-destructive">
                      <Trash2 aria-hidden />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir {resident.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O morador some das listas e da busca da portaria. As encomendas antigas continuam com o nome dele. Para uma saída temporária, use Inativar.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => void run(onDelete)}>
                        Excluir morador
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 aria-hidden className="animate-spin" /> : <Check aria-hidden />}
                {resident ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
