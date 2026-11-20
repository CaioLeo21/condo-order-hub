import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, errorMessage, isSessionLost } from "@/lib/api";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider } from "@/data/store";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import RegisterPackage from "./pages/RegisterPackage";
import RegisterPickup from "./pages/RegisterPickup";
import Residents from "./pages/Residents";
import Users from "./pages/Users";
import Account from "./pages/Account";
import ChangePassword from "./pages/ChangePassword";
import AdminCondominiums from "./pages/admin/AdminCondominiums";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminBilling from "./pages/admin/AdminBilling";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // Falha ao carregar uma lista: avisa uma vez. Sessão caída é tratada pelo AuthContext.
    onError: (error) => {
      if (error instanceof ApiError && (isSessionLost(error.code) || error.code === "PASSWORD_CHANGE_REQUIRED")) return;
      toast.error(errorMessage(error, "Não foi possível carregar os dados."), { id: "query-error" });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Erro da API (4xx) não melhora tentando de novo; só falha de rede ou 5xx.
      retry: (count, error) => count < 2 && (!(error instanceof ApiError) || error.status === 0 || error.status >= 500),
    },
  },
});

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Carregando…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  // Senha provisória: troca antes de qualquer tela.
  if (user.mustChangePassword) return <ChangePassword forced />;

  // Dono do iPackage: só a área de administração.
  if (user.profile === "owner") {
    return (
      <Routes>
        <Route path="/admin/condominios" element={<AdminCondominiums />} />
        <Route path="/admin/planos" element={<AdminPlans />} />
        <Route path="/admin/faturamento" element={<AdminBilling />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<Navigate to="/admin/condominios" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/packages/new" element={<RegisterPackage />} />
      <Route path="/packages/:id/pickup" element={<RegisterPickup />} />
      <Route path="/residents" element={<Residents />} />
      <Route
        path="/users"
        element={
          <ProtectedRoute profiles={["manager", "admin"]}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route path="/doormen" element={<Navigate to="/users" replace />} />
      <Route path="/account" element={<Account />} />
      <Route path="/admin/*" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <StoreProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </StoreProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
