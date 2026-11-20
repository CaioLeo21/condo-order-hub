import { useState } from "react";
import { Check, Loader2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/FormField";
import { OptionGroup, type OptionGroupOption } from "@/components/OptionGroup";
import { slugify } from "@/lib/format";
import { CONDOMINIUM_TYPE_LABEL } from "@/lib/labels";
import type { Condominium, CondominiumInput } from "@/types/condominium";
import type { UnitKind } from "@/types/unit";

const TYPE_OPTIONS: OptionGroupOption<UnitKind>[] = [
  { value: "apartment", label: "Prédio", description: CONDOMINIUM_TYPE_LABEL.apartment.replace("Prédio ", "") },
  { value: "house", label: "Casas", description: CONDOMINIUM_TYPE_LABEL.house.replace("Casas ", "") },
];

interface CondominiumDialogProps {
  open: boolean;
  onClose: () => void;
  condominium?: Condominium;
  /** Já há unidades cadastradas: o tipo não pode mudar. */
  hasUnits?: boolean;
  isSlugTaken: (slug: string, exceptId?: string) => boolean;
  onSave: (input: CondominiumInput, adminName: string) => Promise<void>;
  onToggleStatus?: () => Promise<void>;
}

/** Cadastro e edição de condomínio. No cadastro, cria junto o primeiro administrador. */
export function CondominiumDialog({ open, onClose, condominium, hasUnits, isSlugTaken, onSave, onToggleStatus }: CondominiumDialogProps) {
  const [name, setName] = useState(condominium?.name ?? "");
  const [slug, setSlug] = useState(condominium?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(condominium));
  const [type, setType] = useState<UnitKind | "">(condominium?.type ?? "apartment");
  const [address, setAddress] = useState(condominium?.address ?? "");
  const [adminName, setAdminName] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const finalSlug = slugEdited ? slug : slugify(name);
  const errors = {
    name: tried && !name.trim() ? "Informe o nome do condomínio." : undefined,
    slug: !finalSlug
      ? tried ? "Informe o identificador." : undefined
      : isSlugTaken(finalSlug, condominium?.id) ? "Já existe um condomínio com este identificador." : undefined,
    admin: tried && !condominium && !adminName.trim() ? "Informe quem vai administrar o condomínio." : undefined,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!name.trim() || !finalSlug || errors.slug || !type || (!condominium && !adminName.trim())) return;
    void run(() => onSave({ name: name.trim(), slug: finalSlug, type, address: address.trim() || undefined }, adminName));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-h2">{condominium ? condominium.name : "Cadastrar condomínio"}</DialogTitle>
          <DialogDescription>
            {condominium
              ? condominium.status === "active" ? "Ativo" : "Inativo: ninguém do condomínio consegue entrar."
              : "O primeiro administrador recebe matrícula e senha provisória ao salvar."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5" noValidate>
          <FormField label="Nome" htmlFor="condo-name" error={errors.name}>
            <Input id="condo-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Residencial Vista Verde" aria-invalid={Boolean(errors.name) || undefined} />
          </FormField>
          <FormField label="Identificador (slug)" htmlFor="condo-slug" hint="Usado em endereços e integrações. Letras minúsculas, números e hífen." error={errors.slug}>
            <Input
              id="condo-slug"
              className="font-mono text-code"
              value={finalSlug}
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(slugify(e.target.value));
              }}
              aria-invalid={Boolean(errors.slug) || undefined}
            />
          </FormField>
          {hasUnits ? (
            <p className="text-small text-muted-foreground">
              Tipo: <span className="font-semibold text-foreground">{condominium ? CONDOMINIUM_TYPE_LABEL[condominium.type] : ""}</span> (não muda depois que há unidades cadastradas)
            </p>
          ) : (
            <OptionGroup name="condo-type" label="Tipo" columns={2} options={TYPE_OPTIONS} value={type} onChange={setType} />
          )}
          <FormField label="Endereço" htmlFor="condo-address" hint="Opcional.">
            <Input id="condo-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número - Cidade/UF" />
          </FormField>
          {!condominium && (
            <FormField label="Administrador do condomínio" htmlFor="condo-admin" hint="Normalmente o síndico ou a administradora." error={errors.admin}>
              <Input id="condo-admin" value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Nome completo" aria-invalid={Boolean(errors.admin) || undefined} />
            </FormField>
          )}

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {condominium && onToggleStatus && (
                <Button
                  type="button"
                  variant="ghost"
                  className={condominium.status === "active" ? "text-destructive hover:text-destructive" : undefined}
                  disabled={busy}
                  onClick={() => void run(onToggleStatus)}
                >
                  <Power aria-hidden />
                  {condominium.status === "active" ? "Inativar" : "Reativar"}
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 aria-hidden className="animate-spin" /> : <Check aria-hidden />}
                {condominium ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
