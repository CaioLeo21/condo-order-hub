import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/TablePagination";
import { FilterModal, FilterField } from "@/components/FilterModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  cellClassName?: string;
}

export interface FilterConfig {
  children: React.ReactNode;
  activeCount?: number;
  onClear: () => void;
}

interface PaginatedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchTerm?: string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyFilterMessage?: string;
  pageSize?: number;
  toolbar?: React.ReactNode;
  filters?: FilterConfig;
}

export { FilterField };

export function PaginatedTable<T>({
  data,
  columns,
  searchTerm = '',
  onRowClick,
  emptyMessage = 'Nenhum dado cadastrado',
  emptyFilterMessage = 'Nenhum dado encontrado',
  pageSize,
  toolbar,
  filters,
}: PaginatedTableProps<T>) {
  const pagination = usePagination(data, searchTerm, pageSize);
  const [showFilters, setShowFilters] = useState(false);

  const hasToolbar = toolbar || filters;

  return (
    <>
      {hasToolbar && (
        <div className="flex items-center justify-between mb-6">
          <div>{toolbar}</div>
          {filters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="gap-2 shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {(filters.activeCount ?? 0) > 0 && (
                <Badge className="bg-blue-600 text-white hover:bg-blue-600 px-1.5 py-0 text-xs">
                  {filters.activeCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.header}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {searchTerm ? emptyFilterMessage : emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              pagination.paginated.map((item, index) => (
                <TableRow
                  key={index}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : 'hover:bg-muted/50'}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <TableCell key={col.header} className={col.cellClassName}>
                      {col.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={data.length}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setCurrentPage}
      />

      {filters && (
        <FilterModal
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={() => setShowFilters(false)}
          onClear={() => { filters.onClear(); setShowFilters(false); }}
          activeCount={filters.activeCount}
        >
          {filters.children}
        </FilterModal>
      )}
    </>
  );
}
