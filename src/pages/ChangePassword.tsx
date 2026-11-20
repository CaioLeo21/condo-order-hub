import { Wordmark } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { useAuth } from "@/contexts/AuthContext";

/** Primeiro acesso com senha provisória: cria a senha própria antes de entrar. */
const ChangePassword = ({ forced }: { forced?: boolean }) => {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Wordmark size="lg" />
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="font-display text-h2">Crie sua senha</h1>
          <p className="mt-1 text-small text-muted-foreground">
            Olá, {user?.name.split(" ")[0]}. Você entrou com uma senha provisória; troque por uma só sua para continuar.
          </p>
          <div className="mt-6">
            <ChangePasswordForm forced={forced} />
          </div>
        </div>
        <div className="text-center">
          <Button variant="ghost" onClick={() => void logout()}>Sair</Button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
