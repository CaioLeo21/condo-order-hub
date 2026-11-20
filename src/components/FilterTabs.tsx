import { cn } from "@/lib/utils";

export interface FilterTab<K extends string> {
  key: K;
  label: string;
  count?: number;
}

interface FilterTabsProps<K extends string> {
  tabs: FilterTab<K>[];
  active: NoInfer<K>;
  onChange: (key: NoInfer<K>) => void;
}

/** Abas segmentadas (Pendentes / Retiradas). Se não couberem (celular), rolam para o lado. */
export function FilterTabs<K extends string>({ tabs, active, onChange }: FilterTabsProps<K>) {
  return (
    <div
      role="tablist"
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-md bg-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={(e) => {
              onChange(tab.key);
              e.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" });
            }}
            className={cn(
              "inline-flex h-control-sm shrink-0 items-center gap-2 whitespace-nowrap rounded-[8px] px-4 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
              selected ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="rounded-sm bg-background px-1.5 font-mono text-xs text-foreground">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
