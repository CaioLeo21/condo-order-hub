import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-mono text-code text-muted-foreground">404</p>
        <h1 className="font-display text-h1">Página não encontrada</h1>
        <p className="text-body text-muted-foreground">O endereço pode ter mudado. Volte para a lista de encomendas.</p>
        <Button variant="ghost" asChild>
          <Link to="/">
            <ArrowLeft aria-hidden />
            Voltar para encomendas
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
