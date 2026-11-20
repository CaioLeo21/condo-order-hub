import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { PROFILE_LABEL, SHIFT_LABEL } from "@/lib/labels";

const Account = () => {
  const { user, condominium } = useAuth();
  const { isOwner } = usePermissions();
  if (!user) return null;

  const rows: [string, React.ReactNode][] = [
    ["Nome", user.name],
    ["Matrícula", <span className="font-mono">{user.matricula}</span>],
    ["Perfil", PROFILE_LABEL[user.profile]],
  ];
  if (user.shift) rows.push(["Turno", SHIFT_LABEL[user.shift]]);
  if (condominium) rows.push(["Condomínio", condominium.name]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <PageHeader title="Minha conta" back={{ to: isOwner ? "/admin/condominios" : "/", label: isOwner ? "Condomínios" : "Encomendas" }} />
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="font-display text-h2">Seus dados</h2>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-body">
              {rows.map(([term, value]) => (
                <div key={term} className="contents">
                  <dt className="text-muted-foreground">{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-small text-muted-foreground">Para mudar nome, perfil ou turno, fale com o responsável do condomínio.</p>
          </section>
          <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 font-display text-h2">Alterar senha</h2>
            <ChangePasswordForm />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Account;
