import { useState } from "react";
import { Check, KeyRound, Loader2, Power } from "lucide-react";
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
import { PROFILE_HINT, PROFILE_LABEL, SHIFT_LABEL } from "@/lib/labels";
import type { Profile, Shift, User, UserInput } from "@/types/user";

type AssignableProfile = Exclude<Profile, "owner">;

const SHIFT_OPTIONS: OptionGroupOption<Shift>[] = (["morning", "afternoon", "night"] as const).map((s) => ({ value: s, label: SHIFT_LABEL[s] }));

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  /** Sem usuário = cadastro. */
  user?: User;
  /** Perfis que quem está editando pode atribuir. */
  assignableProfiles: AssignableProfile[];
  /** O próprio usuário logado: não pode se inativar nem mudar o próprio perfil. */
  isMe?: boolean;
  onSave: (data: UserInput) => Promise<void>;
  onToggleStatus?: () => Promise<void>;
  onResetPassword?: () => Promise<void>;
}

export function UserDialog({ open, onClose, user, assignableProfiles, isMe, onSave, onToggleStatus, onResetPassword }: UserDialogProps) {
  const [name, setName] = useState(user?.name ?? "");
  const [profile, setProfile] = useState<AssignableProfile | "">(user && user.profile !== "owner" ? user.profile : "doorman");
  const [shift, setShift] = useState<Shift | "">(user?.shift ?? "");
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

  // Um responsável não edita o perfil de um administrador.
  const canEditProfile = !isMe && (!user || assignableProfiles.includes(user.profile as AssignableProfile));
  const profileOptions: OptionGroupOption<AssignableProfile>[] = assignableProfiles.map((p) => ({ value: p, label: PROFILE_LABEL[p], description: PROFILE_HINT[p] }));

  const nameError = tried && !name.trim() ? "Informe o nome." : undefined;
  const shiftError = tried && profile === "doorman" && !shift ? "Escolha o turno do porteiro." : undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!name.trim() || !profile || (profile === "doorman" && !shift)) return;
    void run(() => onSave({ name, profile, shift: profile === "doorman" ? (shift as Shift) : undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-h2">{user ? user.name : "Cadastrar usuário"}</DialogTitle>
          <DialogDescription>
            {user ? (
              <>
                Matrícula <span className="font-mono">{user.matricula}</span> · {user.status === "active" ? "ativo" : "inativo"}
              </>
            ) : (
              "A matrícula e uma senha provisória são geradas ao salvar."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5" noValidate>
          <FormField label="Nome" htmlFor="user-name" error={nameError}>
            <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" aria-invalid={Boolean(nameError) || undefined} />
          </FormField>

          {canEditProfile ? (
            <OptionGroup name="user-profile" label="Perfil" columns={1} options={profileOptions} value={profile} onChange={setProfile} />
          ) : (
            <p className="text-small text-muted-foreground">
              Perfil: <span className="font-semibold text-foreground">{user ? PROFILE_LABEL[user.profile] : ""}</span>
              {isMe ? " (você não pode mudar o próprio perfil)" : ""}
            </p>
          )}

          {profile === "doorman" && (
            <OptionGroup name="user-shift" label="Turno" columns={3} options={SHIFT_OPTIONS} value={shift} onChange={setShift} error={shiftError} />
          )}

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {user && onResetPassword && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="ghost" disabled={busy}>
                      <KeyRound aria-hidden />
                      Nova senha provisória
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Gerar nova senha para {user.name}?</AlertDialogTitle>
                      <AlertDialogDescription>A senha atual deixa de funcionar. No próximo acesso, {user.name.split(" ")[0]} cria uma senha nova.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void run(onResetPassword)}>Gerar senha</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {user && onToggleStatus && !isMe && canEditProfile && (
                <Button type="button" variant="ghost" className={user.status === "active" ? "text-destructive hover:text-destructive" : undefined} disabled={busy} onClick={() => void run(onToggleStatus)}>
                  <Power aria-hidden />
                  {user.status === "active" ? "Inativar" : "Reativar"}
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={busy || (!canEditProfile && Boolean(user) && name === user?.name)}>
                {busy ? <Loader2 aria-hidden className="animate-spin" /> : <Check aria-hidden />}
                {user ? "Salvar" : "Cadastrar"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
