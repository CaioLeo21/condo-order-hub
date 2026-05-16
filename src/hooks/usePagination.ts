import { useState, useEffect } from "react";

export function usePagination<T>(items: T[], resetDep: unknown, pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [resetDep]);

  const totalPages = Math.ceil(items.length / pageSize);
  const paginated = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return { currentPage, setCurrentPage, totalPages, paginated, pageSize };
}
