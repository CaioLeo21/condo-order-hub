import { cn } from "@/lib/utils";

// Logotipo do iPackage: um "i" cujo pingo é uma caixa de papelão, sobre o ladrilho verde-petróleo.
// As cores do símbolo são fixas (não seguem o tema): é marca, não interface.
// Arquivos para uso fora do app (SVG, PNG, favicon): docs/design-system/brand/.

const PETROL = "#0e5a50";
const STEM = "#f6f4ef";
const BOX_TOP = "#e2a95a";
const BOX_LEFT = "#c9822b";
const BOX_RIGHT = "#9f601e";
const TAPE = "#f2dab0";

/** Só o símbolo (ladrilho). Decorativo por padrão; passe `title` quando aparecer sozinho. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("size-8 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="64" height="64" rx="14" fill={PETROL} />
      <polygon points="32,8 41.75,13.63 32,19.26 22.25,13.63" fill={BOX_TOP} />
      <polygon points="22.25,13.63 32,19.26 32,30.26 22.25,24.63" fill={BOX_LEFT} />
      <polygon points="32,19.26 41.75,13.63 41.75,24.63 32,30.26" fill={BOX_RIGHT} />
      <polyline points="27.12,10.81 36.88,16.44 36.88,27.44" fill="none" stroke={TAPE} strokeWidth="2.4" strokeLinejoin="round" />
      <rect x="25.75" y="33.76" width="12.5" height="23.24" rx="3" fill={STEM} />
    </svg>
  );
}

const SIZES = {
  md: { mark: "size-8", text: "text-[22px] leading-7", gap: "gap-2.5" },
  lg: { mark: "size-14", text: "text-[40px] leading-[44px]", gap: "gap-3.5" },
} as const;

/** Símbolo + "iPackage" (o "i" em kraft). `md` na barra do app, `lg` nas telas de entrada. */
export function Wordmark({ size = "md", className }: { size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <LogoMark className={s.mark} />
      <span className={cn("font-display font-bold tracking-tight text-foreground", s.text)}>
        <span className="text-kraft">i</span>Package
      </span>
    </span>
  );
}
