import React, { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

import { Button } from "@/components/ui/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  showingItems?: number;
  onPageChange: (page: number) => void;
  colorScheme?: string;
  showArrows?: boolean;
  showFirstLast?: boolean;
  maxDisplayedPages?: number;
  showItemCount?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  showingItems,
  onPageChange,
  showArrows = true,
  showFirstLast = false,
  maxDisplayedPages = 5,
  showItemCount = true,
  size = "sm",
  isLoading = false,
}) => {
  const [showCountText, setShowCountText] = useState(false);

  useEffect(() => {
    const update = () => {
      setShowCountText(window.innerWidth >= 768 && showItemCount);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [showItemCount]);

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= maxDisplayedPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(currentPage - Math.floor(maxDisplayedPages / 2), 1);
    let endPage = startPage + maxDisplayedPages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - maxDisplayedPages + 1, 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }, [currentPage, totalPages, maxDisplayedPages]);

  const handleGoToPage = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages && !isLoading) {
      onPageChange(page);
    }
  };

  const itemCountText = useMemo(() => {
    if (!showCountText || !totalItems) return null;

    const startItem = Math.min(
      (currentPage - 1) * (itemsPerPage || 10) + 1,
      totalItems
    );
    const endItem = Math.min(
      startItem + (showingItems || itemsPerPage || 10) - 1,
      totalItems
    );

    return `Showing ${startItem}-${endItem} of ${totalItems} items`;
  }, [currentPage, totalItems, itemsPerPage, showingItems, showCountText]);

  const buttonClass =
    size === "xs"
      ? "px-2 py-1 text-xs"
      : size === "sm"
      ? "px-3 py-2 text-sm"
      : size === "lg"
      ? "px-5 py-3 text-lg"
      : "px-4 py-2 text-base";

  return (
    <div className="mt-6 flex w-full flex-col items-center justify-between gap-3 md:flex-row">
      {showCountText && itemCountText && (
        <p className="text-sm text-gray-500">{itemCountText}</p>
      )}

      <div className={`${showCountText ? "md:ml-auto" : ""}`}>
        <div className="flex items-center justify-center">
          {showFirstLast && (
            <button
              type="button"
              aria-label="Go to first page"
              className="mr-1 rounded-md p-2 text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === 1 || isLoading}
              onClick={() => handleGoToPage(1)}
            >
              <FiChevronsLeft />
            </button>
          )}

          {showArrows && (
            <button
              type="button"
              aria-label="Previous page"
              className="mr-2 rounded-md p-2 text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === 1 || isLoading}
              onClick={() => handleGoToPage(currentPage - 1)}
            >
              <FiChevronLeft />
            </button>
          )}

          {visiblePageNumbers[0] > 1 && (
            <>
              <Button
                size="sm"
                variant="outline"
                className={buttonClass}
                onClick={() => handleGoToPage(1)}
                disabled={isLoading}
              >
                1
              </Button>
              {visiblePageNumbers[0] > 2 && (
                <span className="mx-1 text-gray-500">...</span>
              )}
            </>
          )}

          {visiblePageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              size="sm"
              variant={currentPage === pageNum ? "primary" : "outline"}
              className={`mx-1 ${buttonClass}`}
              onClick={() => handleGoToPage(pageNum)}
              disabled={isLoading}
              aria-current={currentPage === pageNum ? "page" : undefined}
            >
              {pageNum}
              {currentPage === pageNum && (
                <span className="sr-only">(current)</span>
              )}
            </Button>
          ))}

          {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages && (
            <>
              {visiblePageNumbers[visiblePageNumbers.length - 1] <
                totalPages - 1 && <span className="mx-1 text-gray-500">...</span>}
              <Button
                size="sm"
                variant="outline"
                className={buttonClass}
                onClick={() => handleGoToPage(totalPages)}
                disabled={isLoading}
              >
                {totalPages}
              </Button>
            </>
          )}

          {showArrows && (
            <button
              type="button"
              aria-label="Next page"
              className="ml-2 rounded-md p-2 text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === totalPages || isLoading}
              onClick={() => handleGoToPage(currentPage + 1)}
            >
              <FiChevronRight />
            </button>
          )}

          {showFirstLast && (
            <button
              type="button"
              aria-label="Go to last page"
              className="ml-1 rounded-md p-2 text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === totalPages || isLoading}
              onClick={() => handleGoToPage(totalPages)}
            >
              <FiChevronsRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pagination;
