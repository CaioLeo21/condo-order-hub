import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OptionGroupOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface OptionGroupProps<T extends string> {
  /** Usado para ligar o rótulo ao grupo. */
  name: string;
  label?: string;
  options: OptionGroupOption<T>[];
  value: NoInfer<T> | "";
  onChange: (value: NoInfer<T>) => void;
  /** Número de colunas; sem ele as opções quebram linha. */
  columns?: 1 | 2 | 3 | 4;
  error?: string;
  className?: string;
}

const COLS = { 1: "grid-cols-1", 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" } as const;

/** Escolha única em botões grandes de toque (tipo, tamanho, morador, quem retira). */
export function OptionGroup<T extends string>({ name, label, options, value, onChange, columns, error, className }: OptionGroupProps<T>) {
  const labelId = `${name}-label`;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <span id={labelId} className="text-label uppercase text-muted-foreground">
          {label}
        </span>
      )}
      <RadioGroupPrimitive.Root
        value={value}
        onValueChange={(v) => onChange(v as T)}
        aria-labelledby={label ? labelId : undefined}
        className={cn(columns ? cn("grid gap-2", COLS[columns]) : "flex flex-wrap gap-2")}
      >
        {options.map((option) => {
          const Icon = option.icon;
          const selected = option.value === value;
          return (
            <RadioGroupPrimitive.Item
              key={option.value}
              value={option.value}
              className={cn(
                "flex min-h-control-md items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-left text-foreground transition-colors",
                "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
                "data-[state=checked]:border-primary data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground data-[state=checked]:shadow-[inset_0_0_0_1px_hsl(var(--primary))]",
              )}
            >
              {Icon && <Icon aria-hidden className={cn("size-[18px] shrink-0", selected ? "text-secondary-foreground" : "text-muted-foreground")} />}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-body font-semibold">{option.label}</span>
                {option.description && (
                  <span className={cn("text-small", selected ? "text-secondary-foreground" : "text-muted-foreground")}>{option.description}</span>
                )}
              </span>
              <span aria-hidden className="w-[18px] shrink-0">
                {selected && <Check className="size-[18px]" />}
              </span>
            </RadioGroupPrimitive.Item>
          );
        })}
      </RadioGroupPrimitive.Root>
      {error && <span className="text-small font-medium text-destructive">{error}</span>}
    </div>
  );
}
