import { useState } from "react";
import { Building2, CreditCard, Home, KeyRound, LayoutList, LogOut, Menu, Monitor, Moon, RotateCcw, Sun, UserCog, Users, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/data/store";
import { usePermissions } from "@/hooks/usePermissions";
import { USE_MOCKS } from "@/config";
import { initials } from "@/lib/format";
import { PROFILE_LABEL, SHIFT_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/Logo";

const THEMES = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Do sistema", icon: Monitor },
];

/** Barra superior (AppBar): marca, condomínio, navegação e usuário logado. */
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, condominium, logout } = useAuth();
  const { reset } = useStore();
  const { isOwner, canManageUsers } = usePermissions();
  const { theme, setTheme } = useTheme();

  const navigationItems = isOwner
    ? [
        { path: "/admin/condominios", label: "Condomínios", icon: Building2 },
        { path: "/admin/planos", label: "Planos", icon: LayoutList },
        { path: "/admin/faturamento", label: "Faturamento", icon: CreditCard },
      ]
    : [
        { path: "/", label: "Encomendas", icon: Home },
        { path: "/residents", label: "Moradores", icon: Users },
        ...(canManageUsers ? [{ path: "/users", label: "Usuários", icon: UserCog }] : []),
      ];

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" || location.pathname.startsWith("/packages") : location.pathname.startsWith(path);

  const roleLine = user ? [PROFILE_LABEL[user.profile], user.shift ? SHIFT_LABEL[user.shift] : null].filter(Boolean).join(" · ") : "";
  const placeLine = isOwner ? "Administração" : condominium?.name;

  const handleLogout = () => {
    void logout();
    setIsMobileMenuOpen(false);
  };

  const handleReset = () => {
    if (window.confirm("Voltar aos dados de exemplo? Tudo que você cadastrou neste navegador será apagado.")) {
      reset();
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            to={isOwner ? "/admin/condominios" : "/"}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="iPackage — início"
          >
            <Wordmark />
          </Link>
          {placeLine && (
            <span className="hidden items-center gap-2 whitespace-nowrap border-l pl-4 text-sm text-muted-foreground lg:inline-flex">
              <Building2 aria-hidden className="size-4" />
              {placeLine}
            </span>
          )}
          {USE_MOCKS && (
            <Badge variant="muted" className="hidden xl:inline-flex" title="Os dados ficam só neste navegador">
              Dados de exemplo
            </Badge>
          )}
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={isActive(item.path) ? "page" : undefined}
                className={cn(
                  "inline-flex h-control-sm items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive(item.path) ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon aria-hidden className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="hidden items-center gap-2 rounded-md p-1 pr-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
              >
                <span aria-hidden className="inline-flex size-9 items-center justify-center rounded-full bg-secondary text-[13px] font-bold text-secondary-foreground">
                  {initials(user?.name ?? "")}
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold">{user?.name}</span>
                  <span className="block text-xs text-muted-foreground">{roleLine}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="font-mono text-xs text-muted-foreground">Matrícula {user?.matricula}</p>
                <p className="text-xs text-muted-foreground">{roleLine}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/account">
                  <KeyRound className="mr-2 size-4" />
                  Minha conta
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-label uppercase text-muted-foreground">Tema</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                {THEMES.map((t) => (
                  <DropdownMenuRadioItem key={t.value} value={t.value}>
                    <t.icon className="mr-2 size-4" aria-hidden />
                    {t.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              {USE_MOCKS && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleReset}>
                    <RotateCcw className="mr-2 size-4" />
                    Restaurar dados de exemplo
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 size-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t bg-card md:hidden">
          <div className="space-y-3 px-4 py-4">
            <div className="border-b pb-3">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">
                {roleLine} · <span className="font-mono">{user?.matricula}</span>
              </p>
              {placeLine && <p className="mt-1 text-sm text-primary">{placeLine}</p>}
            </div>
            <nav className="space-y-1" aria-label="Principal">
              {[...navigationItems, { path: "/account", label: "Minha conta", icon: KeyRound }].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex min-h-control-md items-center gap-3 rounded-md px-3 transition-colors",
                      isActive(item.path) ? "bg-secondary font-semibold text-secondary-foreground" : "text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon aria-hidden className="size-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex gap-1 rounded-md bg-muted p-1" role="radiogroup" aria-label="Tema">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={theme === t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex h-control-sm flex-1 items-center justify-center gap-1.5 rounded-[8px] text-sm font-semibold",
                    theme === t.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  <t.icon aria-hidden className="size-4" />
                  {t.label}
                </button>
              ))}
            </div>
            <div className="space-y-1 border-t pt-3">
              {USE_MOCKS && (
                <button type="button" onClick={handleReset} className="flex min-h-control-md w-full items-center gap-3 rounded-md px-3 text-foreground hover:bg-muted">
                  <RotateCcw aria-hidden className="size-5" />
                  Restaurar dados de exemplo
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-control-md w-full items-center gap-3 rounded-md px-3 text-destructive hover:bg-muted"
              >
                <LogOut aria-hidden className="size-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
