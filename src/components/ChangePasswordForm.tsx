import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/FormField";
import { useAuth } from "@/contexts/AuthContext";
import { errorMessage } from "@/lib/api";

const MIN_LENGTH = 6;

interface ChangePasswordFormProps {
  /** Primeiro acesso: o campo "atual" pede a senha provisória. */
  forced?: boolean;
  onDone?: () => void;
}

export function ChangePasswordForm({ forced, onDone }: ChangePasswordFormProps) {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<{ field: "current" | "next" | "confirm"; message: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    if (next.length < MIN_LENGTH) return setError({ field: "next", message: `Use pelo menos ${MIN_LENGTH} caracteres.` });
    if (next === current) return setError({ field: "next", message: "A nova senha precisa ser diferente da atual." });
    if (next !== confirm) return setError({ field: "confirm", message: "As duas senhas não são iguais." });
    setSaving(true);
    try {
      if (!(await changePassword(current, next))) {
        return setError({ field: "current", message: forced ? "A senha provisória não confere." : "A senha atual não confere." });
      }
    } catch (err) {
      return setError({ field: "next", message: errorMessage(err) });
    } finally {
      setSaving(false);
    }
    setError(null);
    setCurrent("");
    setNext("");
    setConfirm("");
    setSaved(true);
    onDone?.();
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <FormField label={forced ? "Senha provisória" : "Senha atual"} htmlFor="current" error={error?.field === "current" ? error.message : undefined}>
        <Input id="current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} aria-invalid={error?.field === "current" || undefined} />
      </FormField>
      <FormField label="Nova senha" htmlFor="next" hint={`Pelo menos ${MIN_LENGTH} caracteres.`} error={error?.field === "next" ? error.message : undefined}>
        <Input id="next" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} aria-invalid={error?.field === "next" || undefined} />
      </FormField>
      <FormField label="Repita a nova senha" htmlFor="confirm" error={error?.field === "confirm" ? error.message : undefined}>
        <Input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={error?.field === "confirm" || undefined} />
      </FormField>
      {saved && !forced && (
        <p role="status" className="flex items-center gap-2 text-small font-medium text-retirada-foreground">
          <Check aria-hidden className="size-4" />
          Senha alterada.
        </p>
      )}
      <Button type="submit" className="w-full sm:w-auto" disabled={!current || !next || !confirm || saving}>
        {saving && <Loader2 aria-hidden className="animate-spin" />}
        {forced ? "Criar senha e entrar" : "Alterar senha"}
      </Button>
    </form>
  );
}
