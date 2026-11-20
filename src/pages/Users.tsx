import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { FilterTabs, type FilterTab } from "@/components/FilterTabs";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { errorMessage } from "@/lib/api";
import { UserCard } from "@/components/UserCard";
import { UserDialog } from "@/components/UserDialog";
import { TemporaryPasswordDialog } from "@/components/TemporaryPasswordDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { usePermissions } from "@/hooks/usePermissions";
import { normalizeText } from "@/lib/format";
import { PROFILE_LABEL, SHIFT_LABEL } from "@/lib/labels";
import type { Profile, User, UserInput } from "@/types/user";

type ProfileFilter = "all" | Exclude<Profile, "owner">;
type StatusFilter = "active" | "inactive";

const PROFILE_ORDER: Record<Profile, number> = { admin: 0, manager: 1, doorman: 2, owner: 3 };

/** Usuários do condomínio (tabela Usuario): porteiros, responsáveis e administradores. */
const Users = () => {
  const { user: me } = useAuth();
  const { assignableProfiles } = usePermissions();
  const { isLoading, users, addUser, updateUser, setUserStatus, resetUserPassword } = useData();
  const [profileFilter, setProfileFilter] = useState<ProfileFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialog, setDialog] = useState<{ mode: "new" } | { mode: "edit"; matricula: string } | null>(null);
  const [credentials, setCredentials] = useState<{ title: string; name: string; matricula: string; password: string } | null>(null);

  const byStatus = users.filter((u) => u.status === statusFilter);
  const count = (p: ProfileFilter) => byStatus.filter((u) => p === "all" || u.profile === p).length;

  const visible = useMemo(() => {
    const q = normalizeText(searchTerm.trim());
    return byStatus
      .filter((u) => profileFilter === "all" || u.profile === profileFilter)
      .filter((u) => !q || normalizeText(`${u.name} ${u.matricula} ${PROFILE_LABEL[u.profile]} ${u.shift ? SHIFT_LABEL[u.shift] : ""}`).includes(q))
      .sort((a, b) => PROFILE_ORDER[a.profile] - PROFILE_ORDER[b.profile] || a.name.localeCompare(b.name, "pt-BR"));
  }, [byStatus, profileFilter, searchTerm]);

  const canManage = (u: User) => (assignableProfiles as Profile[]).includes(u.profile);
  const editing = dialog?.mode === "edit" ? users.find((u) => u.matricula === dialog.matricula) : undefined;
  const activeCount = users.filter((u) => u.status === "active").length;

  const profileTabs: FilterTab<ProfileFilter>[] = [
    { key: "all", label: "Todos", count: count("all") },
    { key: "doorman", label: "Porteiros", count: count("doorman") },
    { key: "manager", label: "Responsáveis", count: count("manager") },
    { key: "admin", label: "Administradores", count: count("admin") },
  ];
  const statusTabs: FilterTab<StatusFilter>[] = [
    { key: "active", label: "Ativos", count: users.filter((u) => u.status === "active").length },
    { key: "inactive", label: "Inativos", count: users.filter((u) => u.status === "inactive").length },
  ];

  const handleSave = async (data: UserInput) => {
    try {
      if (dialog?.mode === "edit" && editing) {
        await updateUser(editing.matricula, data);
        toast.success("Usuário atualizado.");
        setDialog(null);
        return;
      }
      const { matricula, password } = await addUser(data);
      setDialog(null);
      setCredentials({ title: `${PROFILE_LABEL[data.profile]} cadastrado`, name: data.name.trim(), matricula, password });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleToggle = async (u: User) => {
    const next = u.status === "active" ? "inactive" : "active";
    try {
      await setUserStatus(u.matricula, next);
      toast.success(next === "inactive" ? `${u.name} foi inativado e não consegue mais entrar.` : `${u.name} foi reativado.`);
      setDialog(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const handleReset = async (u: User) => {
    try {
      const password = await resetUserPassword(u.matricula);
      setDialog(null);
      setCredentials({ title: "Nova senha provisória", name: u.name, matricula: u.matricula, password });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
        <PageHeader
          title="Usuários"
          subtitle={`${activeCount} ${activeCount === 1 ? "usuário ativo" : "usuários ativos"} · cada um entra com a própria matrícula`}
          actions={
            <Button onClick={() => setDialog({ mode: "new" })}>
              <Plus aria-hidden />
              Cadastrar usuário
            </Button>
          }
        />

        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="overflow-x-auto">
              <FilterTabs tabs={profileTabs} active={profileFilter} onChange={setProfileFilter} />
            </div>
            <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nome ou matrícula" />
          </div>
          <FilterTabs tabs={statusTabs} active={statusFilter} onChange={setStatusFilter} />
        </div>

        {isLoading ? (
          <LoadingState label="Carregando usuários…" />
        ) : visible.length === 0 ? (
          <EmptyState
            title={searchTerm ? "Nenhum usuário encontrado" : statusFilter === "inactive" ? "Nenhum usuário inativo" : "Nenhum usuário aqui"}
            description={searchTerm ? "Confira o nome ou a matrícula." : "Cadastre os porteiros e responsáveis que vão usar o iPackage."}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((u) => (
              <UserCard key={u.matricula} user={u} isMe={u.matricula === me?.matricula} onOpen={(x) => setDialog({ mode: "edit", matricula: x.matricula })} />
            ))}
          </div>
        )}
      </main>

      {dialog && (
        <UserDialog
          key={dialog.mode === "edit" ? dialog.matricula : "new"}
          open
          onClose={() => setDialog(null)}
          user={editing}
          isMe={editing?.matricula === me?.matricula}
          assignableProfiles={assignableProfiles}
          onSave={handleSave}
          onToggleStatus={editing ? () => handleToggle(editing) : undefined}
          onResetPassword={editing && editing.matricula !== me?.matricula && canManage(editing) ? () => handleReset(editing) : undefined}
        />
      )}

      {credentials && <TemporaryPasswordDialog open {...credentials} onClose={() => setCredentials(null)} />}
    </div>
  );
};

export default Users;
