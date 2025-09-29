"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationComponentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i);

  const handlePageChange = (page: number) => {
    onPageChange(page);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/search?${params.toString()}`);
  };

  return (
    <Pagination>
      <PaginationContent>
        {currentPage > 0 && (
          <PaginationItem>
            <PaginationPrevious size="md" onClick={() => handlePageChange(currentPage - 1)} />
          </PaginationItem>
        )}

        {pageNumbers.map((num) => (
          <PaginationItem key={num}>
            <PaginationLink
               size="md"
              onClick={() => handlePageChange(num)}
              className={currentPage === num ? "font-bold" : ""}
            >
              {num + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        {currentPage < totalPages - 1 && (
          <PaginationItem>
            <PaginationNext size="md" onClick={() => handlePageChange(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
