/** Carregando a primeira leitura da API (lista ou tela). */
export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <span aria-hidden className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-body">{label}</p>
    </div>
  );
}
