import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  /** Mensagem que diz como resolver. Substitui a dica. */
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/** Rótulo em estilo label + campo + dica ou erro. */
export function FormField({ label, htmlFor, hint, error, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={htmlFor} className="text-label uppercase text-muted-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-msg`} className="text-small font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p id={`${htmlFor}-msg`} className="text-small text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
