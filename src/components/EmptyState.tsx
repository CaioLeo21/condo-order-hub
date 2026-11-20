interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

/** Tela vazia: diz o que aconteceu e o próximo passo. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <h2 className="font-display text-h2 text-foreground">{title}</h2>
      <p className="max-w-md text-body text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
