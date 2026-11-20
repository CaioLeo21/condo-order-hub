import { useState } from "react";
import { Box, Check, ImageOff, Loader2, Mail, PackageOpen, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { errorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
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
import { StatusBadge } from "@/components/StatusBadge";
import { formatWhen } from "@/lib/format";
import { PACKAGE_KIND_LABEL, PACKAGE_SIZE_HINT, PACKAGE_SIZE_LABEL } from "@/lib/labels";
import type { PackageEdit, PackageKind, PackageSize, PackageView } from "@/types/package";

interface PackageDetailsModalProps {
  package: PackageView;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, patch: PackageEdit) => Promise<void>;
  /** Exclusão com motivo (soft delete). */
  onDelete: (id: string, reason: string) => Promise<void>;
  onRegisterPickup?: (pkg: PackageView) => void;
  canDelete?: boolean;
}

const KIND_OPTIONS: OptionGroupOption<PackageKind>[] = [
  { value: "envelope", label: PACKAGE_KIND_LABEL.envelope, icon: Mail },
  { value: "box", label: PACKAGE_KIND_LABEL.box, icon: Box },
  { value: "bag", label: PACKAGE_KIND_LABEL.bag, icon: PackageOpen },
  { value: "other", label: PACKAGE_KIND_LABEL.other, icon: Box },
];
const SIZE_OPTIONS: OptionGroupOption<PackageSize>[] = (["small", "medium", "large"] as const).map((s) => ({ value: s, label: PACKAGE_SIZE_LABEL[s], description: PACKAGE_SIZE_HINT[s] }));

function Field({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <dt className="text-label uppercase text-muted-foreground">{label}</dt>
      <dd className={mono ? "mt-0.5 font-mono text-code" : "mt-0.5 text-body"}>{children}</dd>
    </div>
  );
}

/** Foto ou assinatura; se o arquivo não carregar (link vencido, arquivo apagado), mostra um aviso no lugar. */
function Picture({ src, alt, caption, className }: { src: string; alt: string; caption: string; className: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="overflow-hidden rounded-lg border">
      {failed ? (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-muted text-small text-muted-foreground">
          <ImageOff aria-hidden className="h-5 w-5" />
          Imagem indisponível
        </div>
      ) : (
        <img src={src} alt={alt} onError={() => setFailed(true)} className={cn("aspect-video w-full", className)} />
      )}
      <figcaption className="border-t bg-card px-3 py-2 text-small text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}

export function PackageDetailsModal({
  package: pkg,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onRegisterPickup,
  canDelete = false,
}: PackageDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const initial = {
    senderCompany: pkg.senderCompany,
    trackingCode: pkg.trackingCode ?? "",
    kind: pkg.kind,
    size: pkg.size,
    notes: pkg.notes ?? "",
  };
  const [form, setForm] = useState(initial);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    setBusy(true);
    try {
      await onUpdate(pkg.id, {
        senderCompany: form.senderCompany.trim(),
        trackingCode: form.trackingCode.trim() || undefined,
        kind: form.kind,
        size: form.size,
        notes: form.notes.trim() || undefined,
      });
      setIsEditing(false);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await onDelete(pkg.id, reason.trim());
      toast.success(`Encomenda ${pkg.code} excluída.`);
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col-reverse items-start gap-2 pr-8 sm:flex-row sm:justify-between sm:gap-3">
            <div>
              <p className="font-mono text-code text-primary">{pkg.recipientUnit}</p>
              <DialogTitle className="font-display text-h2">{pkg.recipientName}</DialogTitle>
              <DialogDescription className="font-mono text-small">{pkg.code}</DialogDescription>
            </div>
            <StatusBadge status={pkg.status} />
          </div>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Remetente" htmlFor="senderCompany">
                <Input id="senderCompany" value={form.senderCompany} onChange={(e) => setForm({ ...form, senderCompany: e.target.value })} />
              </FormField>
              <FormField label="Código de rastreio" htmlFor="trackingCode">
                <Input id="trackingCode" className="font-mono" value={form.trackingCode} onChange={(e) => setForm({ ...form, trackingCode: e.target.value })} />
              </FormField>
            </div>
            <OptionGroup name="edit-kind" label="Tipo" columns={4} options={KIND_OPTIONS} value={form.kind} onChange={(kind) => setForm({ ...form, kind })} />
            <OptionGroup name="edit-size" label="Tamanho" columns={3} options={SIZE_OPTIONS} value={form.size} onChange={(size) => setForm({ ...form, size })} />
            <FormField label="Observação" htmlFor="notes">
              <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </FormField>
            <div className="flex justify-end gap-3 border-t pt-5">
              <Button variant="ghost" onClick={() => { setForm(initial); setIsEditing(false); }}>Cancelar</Button>
              <Button onClick={() => void handleSave()} disabled={!form.senderCompany.trim() || busy}>
                {busy ? <Loader2 aria-hidden className="animate-spin" /> : <Check aria-hidden />}
                Salvar alterações
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Tipo">{PACKAGE_KIND_LABEL[pkg.kind]}</Field>
              <Field label="Tamanho">{PACKAGE_SIZE_LABEL[pkg.size]}</Field>
              <Field label="Remetente">{pkg.senderCompany}</Field>
              {pkg.trackingCode && <Field label="Código de rastreio" mono>{pkg.trackingCode}</Field>}
              <Field label="Chegada">{formatWhen(pkg.receivedAt)}</Field>
              <Field label="Recebida por">{pkg.receivedByName}</Field>
              {pkg.status === "collected" && pkg.collectedAt && (
                <>
                  <Field label="Retirada">{formatWhen(pkg.collectedAt)}</Field>
                  <Field label="Retirada por">
                    {pkg.collectedBy}
                    {pkg.collectedByDocument ? ` · ${pkg.collectedByDocument}` : ""}
                  </Field>
                  {pkg.deliveredByName && <Field label="Entregue por">{pkg.deliveredByName}</Field>}
                </>
              )}
              {pkg.notes && <div className="sm:col-span-2"><Field label="Observação">{pkg.notes}</Field></div>}
            </dl>

            {(pkg.photoUrl || pkg.signatureUrl) && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {pkg.photoUrl && (
                  <Picture key={pkg.photoUrl} src={pkg.photoUrl} alt={`Foto da encomenda ${pkg.code}`} caption="Foto da chegada" className="bg-muted object-cover" />
                )}
                {pkg.signatureUrl && (
                  <Picture key={pkg.signatureUrl} src={pkg.signatureUrl} alt={`Assinatura de ${pkg.collectedBy}`} caption="Assinatura na retirada" className="bg-card object-contain" />
                )}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-between">
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setIsEditing(true)}>
                  <Pencil aria-hidden />
                  Editar
                </Button>
                {canDelete && (
                  <AlertDialog onOpenChange={(open) => !open && setReason("")}>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="text-destructive hover:text-destructive">
                        <Trash2 aria-hidden />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir encomenda {pkg.code}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ela sai da lista da portaria. O registro e o motivo ficam guardados para consulta.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <FormField label="Motivo" htmlFor="delete-reason" hint="Ex.: registrada em duplicidade, devolvida ao remetente.">
                        <Textarea id="delete-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
                      </FormField>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <Button
                          variant="destructive"
                          disabled={reason.trim().length < 3 || busy}
                          onClick={() => void handleDelete()}
                        >
                          {busy && <Loader2 aria-hidden className="animate-spin" />}
                          Excluir encomenda
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              {pkg.status === "pending" && onRegisterPickup && (
                <Button onClick={() => onRegisterPickup(pkg)}>
                  <Check aria-hidden />
                  Registrar retirada
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
