import { Clock, IdCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/format";
import { PROFILE_LABEL, SHIFT_LABEL } from "@/lib/labels";
import type { User } from "@/types/user";

interface UserCardProps {
  user: User;
  isMe?: boolean;
  onOpen: (user: User) => void;
}

export function UserCard({ user, isMe, onOpen }: UserCardProps) {
  return (
    <article
      tabIndex={0}
      onClick={() => onOpen(user)}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(user); }}
      aria-label={`${user.name}, ${PROFILE_LABEL[user.profile]}, matrícula ${user.matricula}`}
      className="flex cursor-pointer flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
            {initials(user.name)}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-display text-h2">
              {user.name}
              {isMe && <span className="ml-2 align-middle text-small font-normal text-muted-foreground">(você)</span>}
            </h3>
            <p className="text-small text-muted-foreground">{PROFILE_LABEL[user.profile]}</p>
          </div>
        </div>
        <Badge variant={user.status === "active" ? "secondary" : "muted"} className="shrink-0">
          {user.status === "active" ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="space-y-1 text-small text-muted-foreground">
        <div className="flex items-center gap-2">
          <IdCard aria-hidden className="size-4 shrink-0" />
          <span>
            Matrícula <span className="font-mono text-foreground">{user.matricula}</span>
          </span>
        </div>
        {user.shift && (
          <div className="flex items-center gap-2">
            <Clock aria-hidden className="size-4 shrink-0" />
            <span>Turno {SHIFT_LABEL[user.shift].toLowerCase()}</span>
          </div>
        )}
        {user.mustChangePassword && <p className="text-pendente-foreground">Ainda não trocou a senha provisória</p>}
      </div>
    </article>
  );
}
