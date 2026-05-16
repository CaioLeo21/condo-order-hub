import { Button } from "@/components/ui/button";
import type { Package } from "@/types/package";

interface FilterTabsProps {
  activeFilter: 'all' | Package['status'];
  onFilterChange: (filter: 'all' | Package['status']) => void;
  counts: {
    all: number;
    received: number;
    collected: number;
  };
}

export function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
  const tabs = [
    { key: 'all' as const, label: 'Todas', count: counts.all },
    { key: 'received' as const, label: 'Recebidas', count: counts.received },
    { key: 'collected' as const, label: 'Retiradas', count: counts.collected },
  ];

  return (
    <div className="flex space-x-2">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          variant={activeFilter === tab.key ? "default" : "outline"}
          onClick={() => onFilterChange(tab.key)}
          className={`${
            activeFilter === tab.key
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
              : "hover:bg-gray-50"
          }`}
        >
          {tab.label}
          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
            activeFilter === tab.key
              ? "bg-white bg-opacity-20 text-white"
              : "bg-gray-100 text-gray-600"
          }`}>
            {tab.count}
          </span>
        </Button>
      ))}
    </div>
  );
}
