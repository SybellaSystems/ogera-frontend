import React from "react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  isFetching = false,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const visiblePages: Array<number | "ellipsis"> = [];

  if (totalPages <= 4) {
    for (let page = 1; page <= totalPages; page += 1) {
      visiblePages.push(page);
    }
  } else {
    const sidePages = 1;

    if (currentPage <= 2) {
      visiblePages.push(1, 2, 3, "ellipsis", totalPages);
    } else if (currentPage >= totalPages - 1) {
      visiblePages.push(1, "ellipsis", totalPages - 2, totalPages - 1, totalPages);
    } else {
      visiblePages.push(
        1,
        "ellipsis",
        currentPage - sidePages,
        currentPage,
        currentPage + sidePages,
        "ellipsis",
        totalPages,
      );
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1 || isFetching}
        className="min-w-[74px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/60 p-1 shadow-sm">
        {visiblePages.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-10 w-10 items-center justify-center text-lg font-semibold text-slate-500"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              disabled={isFetching}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition ${
                currentPage === page
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages || isFetching}
        className="min-w-[74px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;
