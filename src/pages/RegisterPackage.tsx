import { useMemo, useRef, useState } from "react";
import { Box, Camera, Check, Loader2, Mail, PackageOpen, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { OptionGroup, type OptionGroupOption } from "@/components/OptionGroup";
import { PackageCard } from "@/components/PackageCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { uploadFile, type UploadedFile } from "@/data/upload";
import { errorMessage } from "@/lib/api";
import { LoadingState } from "@/components/LoadingState";
import { compressImage } from "@/lib/image";
import { formatUnit, normalizeText, normalizeUnitQuery, unitCode } from "@/lib/format";
import { PACKAGE_KIND_LABEL, PACKAGE_SIZE_HINT, PACKAGE_SIZE_LABEL, residentTypeLabel } from "@/lib/labels";
import type { PackageKind, PackageSize, PackageView } from "@/types/package";
import type { Unit } from "@/types/unit";

const KIND_OPTIONS: OptionGroupOption<PackageKind>[] = [
  { value: "envelope" as const, label: PACKAGE_KIND_LABEL.envelope, icon: Mail },
  { value: "box" as const, label: PACKAGE_KIND_LABEL.box, icon: Box },
  { value: "bag" as const, label: PACKAGE_KIND_LABEL.bag, icon: PackageOpen },
  { value: "other" as const, label: PACKAGE_KIND_LABEL.other, icon: Box },
];
const SIZE_OPTIONS: OptionGroupOption<PackageSize>[] = (["small", "medium", "large"] as const).map((s) => ({ value: s, label: PACKAGE_SIZE_LABEL[s], description: PACKAGE_SIZE_HINT[s] }));

const fieldLabel = "text-label uppercase text-muted-foreground";

/** Tela "Registrar encomenda": unidade → morador → tipo, tamanho, remetente, observação e foto. */
const RegisterPackage = () => {
  const navigate = useNavigate();
  const { user, condominium } = useAuth();
  const { isLoading, units, packages, findUnitByCode, residentsOfUnit, addPackage } = useData();
  const fileRef = useRef<HTMLInputElement>(null);

  const [unitQuery, setUnitQuery] = useState("");
  const [unitId, setUnitId] = useState("");
  const [residentUnitId, setResidentUnitId] = useState("");
  const [kind, setKind] = useState<PackageKind | "">("box");
  const [size, setSize] = useState<PackageSize | "">("");
  const [senderCompany, setSenderCompany] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<UploadedFile | undefined>();
  const photoUrl = photo?.url;
  const [photoState, setPhotoState] = useState<"idle" | "uploading" | "error">("idle");
  const [photoError, setPhotoError] = useState("");
  const [saving, setSaving] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const created = createdId ? packages.find((p) => p.id === createdId) ?? null : null;

  const [startedAt] = useState(() => new Date());
  const time = startedAt.toTimeString().slice(0, 5);
  const unit = units.find((u) => u.id === unitId);
  const unitResidents = unit ? residentsOfUnit(unit.id) : [];
  const isHouse = condominium?.type === "house";

  // Sugestões enquanto digita: por código da unidade ou nome do morador.
  const suggestions = useMemo(() => {
    const q = unitQuery.trim();
    if (!q || unit) return [];
    const code = normalizeUnitQuery(q);
    const name = normalizeText(q);
    const matches = units.filter((u) => {
      if (code && normalizeUnitQuery(unitCode(u)).startsWith(code)) return true;
      return name.length >= 2 && residentsOfUnit(u.id).some(({ resident }) => normalizeText(resident.name).includes(name));
    });
    return matches.slice(0, 6);
  }, [unitQuery, unit, units, residentsOfUnit]);

  const chooseUnit = (u: Unit) => {
    setUnitId(u.id);
    setUnitQuery(unitCode(u));
    const people = residentsOfUnit(u.id);
    setResidentUnitId(people.length === 1 ? people[0].residentUnitId : "");
  };

  const onUnitInput = (value: string) => {
    setUnitQuery(value);
    const exact = findUnitByCode(value);
    if (exact) chooseUnit(exact);
    else {
      setUnitId("");
      setResidentUnitId("");
    }
  };

  const lastFile = useRef<File | null>(null);
  const onPhoto = async (file: File | undefined | null) => {
    if (!file) return;
    lastFile.current = file;
    setPhotoState("uploading");
    try {
      const compressed = await compressImage(file);
      setPhoto(await uploadFile(compressed, "package-photo"));
      setPhotoState("idle");
    } catch (err) {
      setPhotoError(errorMessage(err, "Confira a conexão e tente de novo."));
      setPhotoState("error");
    }
  };

  const ready = Boolean(unit && residentUnitId && kind && size && senderCompany.trim() && photoState !== "uploading" && !saving);
  const missing = [
    !unit && "unidade",
    unit && !residentUnitId && "morador",
    !kind && "tipo",
    !size && "tamanho",
    !senderCompany.trim() && "remetente",
  ].filter(Boolean) as string[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || !unit || !kind || !size) return;
    setSaving(true);
    try {
      const id = await addPackage({
        residentUnitId,
        senderCompany: senderCompany.trim(),
        trackingCode: trackingCode.trim() || undefined,
        kind,
        size,
        notes: notes.trim() || undefined,
        photoUrl: photo?.key,
      });
      setCreatedId(id);
    } catch (err) {
      toast.error(errorMessage(err, "A encomenda não foi registrada. Tente de novo."));
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setUnitQuery("");
    setUnitId("");
    setResidentUnitId("");
    setKind("box");
    setSize("");
    setSenderCompany("");
    setTrackingCode("");
    setNotes("");
    setPhoto(undefined);
    setPhotoState("idle");
    setCreatedId(null);
  };

  const resident = unitResidents.find((r) => r.residentUnitId === residentUnitId)?.resident;
  const preview: PackageView = {
    id: "preview",
    code: "Nº gerado ao registrar",
    condominiumId: user?.condominiumId ?? "",
    residentUnitId,
    unitId,
    residentId: resident?.id ?? "",
    recipientName: resident?.name ?? "Morador",
    recipientUnit: unit ? formatUnit(unit) : "Unidade",
    senderCompany: senderCompany || "—",
    kind: kind || "box",
    size: size || "medium",
    notes: notes || undefined,
    receivedAt: startedAt.toISOString(),
    receivedBy: user?.matricula ?? "",
    receivedByName: user?.name ?? "",
    status: "pending",
    createdAt: startedAt.toISOString(),
    updatedAt: startedAt.toISOString(),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <PageHeader
          title="Registrar encomenda"
          subtitle={`Chegada às ${time} · registrada por ${user?.name ?? ""}`}
          back={{ to: "/", label: "Encomendas" }}
        />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {isLoading ? (
            <section className="rounded-lg border bg-card shadow-sm">
              <LoadingState label="Carregando unidades e moradores…" />
            </section>
          ) : created ? (
            <section className="flex flex-col items-start gap-3 rounded-lg border bg-card p-6 shadow-sm">
              <StatusBadge status="pending" />
              <h2 className="font-display text-h2">Encomenda registrada</h2>
              <p className="text-body text-muted-foreground">
                {created.code} já aparece na lista de pendentes de {created.recipientUnit}.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={reset}>
                  <Plus aria-hidden />
                  Registrar outra
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/">Voltar para encomendas</Link>
                </Button>
              </div>
            </section>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-6 rounded-lg border bg-card p-4 shadow-sm sm:p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="unit" className={fieldLabel}>Unidade</Label>
                  <Input
                    id="unit"
                    className="font-mono text-code"
                    value={unitQuery}
                    onChange={(e) => onUnitInput(e.target.value)}
                    placeholder={isHouse ? "Ex.: Q3-12 ou nome do morador" : "Ex.: B-204 ou nome do morador"}
                    autoComplete="off"
                    aria-invalid={Boolean(unitQuery && !unit && suggestions.length === 0) || undefined}
                    aria-describedby="unit-hint"
                  />
                  <p id="unit-hint" className={unitQuery && !unit && suggestions.length === 0 ? "text-small font-medium text-destructive" : "text-small text-muted-foreground"}>
                    {unit
                      ? formatUnit(unit)
                      : unitQuery && suggestions.length === 0
                        ? `Unidade não encontrada. Confira ${isHouse ? "quadra" : "bloco"} e número.`
                        : isHouse ? "Quadra e número da casa." : "Bloco e número do apartamento."}
                  </p>
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1" aria-label="Unidades encontradas">
                      {suggestions.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => chooseUnit(u)}
                          className="inline-flex min-h-control-sm items-center gap-2 rounded-md border border-input bg-card px-3 text-left text-small hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="font-mono text-code text-primary">{unitCode(u)}</span>
                          <span className="text-muted-foreground">
                            {residentsOfUnit(u.id).map(({ resident: r }) => r.name.split(" ")[0]).join(", ") || "sem moradores"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sender" className={fieldLabel}>Remetente</Label>
                  <Input id="sender" value={senderCompany} onChange={(e) => setSenderCompany(e.target.value)} placeholder="Ex.: Correios, Mercado Livre" />
                  <p className="text-small text-muted-foreground">Quem entregou na portaria.</p>
                </div>
              </div>

              {unit && (
                unitResidents.length ? (
                  <OptionGroup
                    name="resident"
                    label="Morador"
                    columns={2}
                    value={residentUnitId}
                    onChange={setResidentUnitId}
                    options={unitResidents.map(({ resident: r, residentUnitId: id }) => ({ value: id, label: r.name, description: residentTypeLabel(r.residentType, r.residentTypeDescription) }))}
                  />
                ) : (
                  <p className="text-small font-medium text-destructive">Esta unidade não tem moradores ativos. Cadastre o morador antes de registrar.</p>
                )
              )}

              <OptionGroup name="kind" label="Tipo" columns={4} options={KIND_OPTIONS} value={kind} onChange={setKind} />
              <OptionGroup name="size" label="Tamanho" columns={3} options={SIZE_OPTIONS} value={size} onChange={setSize} />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="tracking" className={fieldLabel}>Código de rastreio</Label>
                  <Input id="tracking" className="font-mono text-code" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} placeholder="Opcional" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="notes" className={fieldLabel}>Observação</Label>
                  <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
                  <p className="text-small text-muted-foreground">Ex.: caixa amassada, precisa de refrigeração.</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className={fieldLabel}>Foto da encomenda</span>
                <div className="flex flex-col gap-4 rounded-lg border border-dashed border-input bg-background p-4 sm:flex-row sm:items-center">
                  <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
                    {photoState === "uploading" ? (
                      <Loader2 aria-hidden className="size-7 animate-spin" />
                    ) : photoUrl ? (
                      <img src={photoUrl} alt="Foto da encomenda" className="size-full object-cover" />
                    ) : (
                      <Camera aria-hidden className="size-7" />
                    )}
                  </div>
                  <div className="flex-1" aria-live="polite">
                    <p className="text-body font-semibold">
                      {photoState === "uploading" ? "Enviando foto…" : photoState === "error" ? "A foto não foi enviada" : photoUrl ? "Foto anexada" : "Sem foto"}
                    </p>
                    <p className={photoState === "error" ? "text-small font-medium text-destructive" : "text-small text-muted-foreground"}>
                      {photoState === "error"
                        ? photoError
                        : photoUrl
                          ? "Confira se a etiqueta está legível."
                          : "Fotografe a etiqueta e o volume inteiro."}
                    </p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="sr-only"
                    tabIndex={-1}
                    onChange={(e) => {
                      void onPhoto(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  {photoState === "error" ? (
                    <Button type="button" variant="secondary" onClick={() => void onPhoto(lastFile.current)}>
                      Tentar de novo
                    </Button>
                  ) : (
                    <Button type="button" variant="secondary" disabled={photoState === "uploading"} onClick={() => fileRef.current?.click()}>
                      <Camera aria-hidden />
                      {photoUrl ? "Tirar outra" : "Tirar foto"}
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
                {!ready && missing.length > 0 && (
                  <p className="text-small text-muted-foreground sm:mr-auto">Falta: {missing.join(", ")}.</p>
                )}
                <Button type="button" variant="ghost" onClick={() => navigate("/")}>Cancelar</Button>
                <Button type="submit" disabled={!ready}>
                  {saving ? <Loader2 aria-hidden className="animate-spin" /> : <Check aria-hidden />}
                  {saving ? "Registrando…" : "Registrar encomenda"}
                </Button>
              </div>
            </form>
          )}

          <aside className="hidden flex-col gap-3 md:flex lg:sticky lg:top-24">
            <span className={fieldLabel}>Prévia na lista</span>
            <PackageCard package={created ?? preview} />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default RegisterPackage;
