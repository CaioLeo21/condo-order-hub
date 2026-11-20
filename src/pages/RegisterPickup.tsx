import { useState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { OptionGroup } from "@/components/OptionGroup";
import { PackageCard } from "@/components/PackageCard";
import { SignaturePad } from "@/components/SignaturePad";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { useData } from "@/contexts/DataContext";
import { uploadFile } from "@/data/upload";
import { errorMessage } from "@/lib/api";
import { formatWhen } from "@/lib/format";
import type { PackageView } from "@/types/package";

const OTHER = "__other__";
const fieldLabel = "text-label uppercase text-muted-foreground";

/** Tela "Registrar retirada": confere a encomenda, escolhe quem retira e coleta a assinatura. */
const RegisterPickup = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoading, packages } = useData();
  const pkg = packages.find((p) => p.id === id);

  if (isLoading || !pkg) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
          {isLoading ? (
            <LoadingState label="Carregando encomenda…" />
          ) : (
            <EmptyState
              title="Encomenda não encontrada"
              description="Ela pode ter sido excluída ou pertencer a outro condomínio."
              action={<Button variant="ghost" asChild><Link to="/"><ArrowLeft aria-hidden />Voltar para encomendas</Link></Button>}
            />
          )}
        </main>
      </div>
    );
  }

  return <PickupForm pkg={pkg} />;
};

function PickupForm({ pkg }: { pkg: PackageView }) {
  const { residentsOfUnit, registerPickup } = useData();
  const [who, setWho] = useState<string>(pkg.residentId);
  const [otherName, setOtherName] = useState("");
  const [otherDocument, setOtherDocument] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [justCollected, setJustCollected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const people = residentsOfUnit(pkg.unitId);
  const options = [
    ...people.map(({ resident: r }) => ({
      value: r.id,
      label: r.name,
      description: r.id === pkg.residentId ? `Destinatário · ${pkg.recipientUnit}` : "Mora na mesma unidade",
    })),
    { value: OTHER, label: "Outra pessoa", description: "Informe nome e documento" },
  ];

  const isOther = who === OTHER;
  const whoName = isOther ? otherName.trim() : people.find(({ resident: r }) => r.id === who)?.resident.name ?? "";
  const ready = Boolean(who && signature && whoName) && !saving;
  const alreadyCollected = pkg.status === "collected";

  const confirm = async () => {
    if (!ready || !signature) return;
    setSaving(true);
    setSaveError("");
    try {
      const { key } = await uploadFile(signature, "signature");
      await registerPickup(pkg.id, {
        collectedBy: whoName,
        collectedByDocument: isOther ? otherDocument.trim() || undefined : undefined,
        signatureUrl: key,
      });
      setJustCollected(true);
    } catch (err) {
      setSaveError(errorMessage(err, "A retirada não foi salva. Confira a conexão e tente de novo."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <PageHeader
          title="Registrar retirada"
          subtitle="Confira a encomenda, escolha quem está retirando e colete a assinatura."
          back={{ to: "/", label: "Encomendas" }}
        />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <PackageCard package={pkg} />
            {pkg.photoUrl && (
              <figure className="overflow-hidden rounded-lg border bg-card">
                <img src={pkg.photoUrl} alt={`Foto da encomenda ${pkg.code}`} className="aspect-video w-full bg-muted object-cover" />
                <figcaption className="border-t px-3 py-2 text-small text-muted-foreground">Foto da chegada · {formatWhen(pkg.receivedAt)}</figcaption>
              </figure>
            )}
          </div>

          {alreadyCollected ? (
            <section className="flex flex-col items-start gap-3 rounded-lg border bg-card p-6 shadow-sm">
              <StatusBadge status="collected" />
              <h2 className="font-display text-h2">{justCollected ? "Retirada registrada" : "Esta encomenda já foi retirada"}</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-body">
                <dt className="text-muted-foreground">Retirada por</dt>
                <dd>{pkg.collectedBy}{pkg.collectedByDocument ? ` · ${pkg.collectedByDocument}` : ""}</dd>
                {pkg.collectedAt && (<><dt className="text-muted-foreground">Quando</dt><dd>{formatWhen(pkg.collectedAt)}</dd></>)}
                {pkg.deliveredByName && (<><dt className="text-muted-foreground">Entregue por</dt><dd>{pkg.deliveredByName}</dd></>)}
              </dl>
              {pkg.signatureUrl && (
                <img src={pkg.signatureUrl} alt={`Assinatura de ${pkg.collectedBy}`} className="h-28 w-full max-w-md rounded-md border bg-card object-contain" />
              )}
              <Button variant="ghost" asChild>
                <Link to="/"><ArrowLeft aria-hidden />Voltar para encomendas</Link>
              </Button>
            </section>
          ) : (
            <section className="flex flex-col gap-6 rounded-lg border bg-card p-4 shadow-sm sm:p-6">
              <OptionGroup name="who" label="Quem está retirando?" columns={1} options={options} value={who} onChange={setWho} />
              {isOther && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="otherName" className={fieldLabel}>Nome de quem retira</Label>
                    <Input id="otherName" value={otherName} onChange={(e) => setOtherName(e.target.value)} placeholder="Nome completo" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="otherDoc" className={fieldLabel}>Documento</Label>
                    <Input id="otherDoc" className="font-mono text-code" value={otherDocument} onChange={(e) => setOtherDocument(e.target.value)} placeholder="RG ou CPF (opcional)" />
                  </div>
                </div>
              )}
              <SignaturePad label={`Assinatura de ${whoName || "quem retira"}`} height={170} onChange={setSignature} />
              <div className="space-y-2">
                <Button size="lg" className="w-full" disabled={!ready} onClick={() => void confirm()}>
                  {saving ? <Loader2 aria-hidden className="animate-spin" /> : <Check aria-hidden />}
                  {saving ? "Confirmando…" : "Confirmar retirada"}
                </Button>
                {saveError && (
                  <p role="alert" className="text-center text-small font-medium text-destructive">{saveError}</p>
                )}
                {!ready && !saving && (
                  <p className="text-center text-small text-muted-foreground">
                    {isOther && !otherName.trim() ? "Informe o nome de quem está retirando." : "Colete a assinatura para confirmar."}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default RegisterPickup;
