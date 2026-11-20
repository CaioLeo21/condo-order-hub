import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TemporaryPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  name: string;
  matricula: string;
  password: string;
}

/** Mostra uma única vez a matrícula e a senha provisória de um usuário novo ou com senha redefinida. */
export function TemporaryPasswordDialog({ open, onClose, title, name, matricula, password }: TemporaryPasswordDialogProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Matrícula: ${matricula}\nSenha provisória: ${password}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-h2">{title}</DialogTitle>
          <DialogDescription>
            Entregue estes dados para {name}. A senha só aparece agora; no primeiro acesso, {name.split(" ")[0]} cria uma senha própria.
          </DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3 rounded-lg border bg-background p-4">
          <dt className="text-label uppercase text-muted-foreground">Matrícula</dt>
          <dd className="font-mono text-h2">{matricula}</dd>
          <dt className="text-label uppercase text-muted-foreground">Senha provisória</dt>
          <dd className="font-mono text-h2 tracking-wider">{password}</dd>
        </dl>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={copy}>
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <Button onClick={onClose}>Pronto, anotei</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
