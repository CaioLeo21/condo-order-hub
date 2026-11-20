import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatBRL, parseMoneyInput } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MoneyInputProps extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  value: number;
  onValueChange: (value: number) => void;
}

/** Campo de valor em reais: digite só os números, os centavos entram sozinhos (R$ 1.234,56). */
export function MoneyInput({ value, onValueChange, className, ...props }: MoneyInputProps) {
  return (
    <Input
      {...props}
      inputMode="numeric"
      className={cn("font-mono text-code", className)}
      value={formatBRL(value)}
      onChange={(e) => onValueChange(parseMoneyInput(e.target.value))}
    />
  );
}
