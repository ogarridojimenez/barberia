"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 20,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 36,
    height: 36,
    padding: "0 12px",
    fontSize: 14,
    fontWeight: isActive ? 600 : 400,
    color: isActive ? "#18181B" : "#FAFAFA",
    background: isActive
      ? "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)"
      : "#27272A",
    border: `1px solid ${isActive ? "#D4AF37" : "#3F3F46"}`,
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.15s ease",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 24,
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {totalItems !== undefined && (
        <span style={{ fontSize: 14, color: "#71717A" }}>
          Mostrando {((currentPage - 1) * itemsPerPage) + 1}-
          {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
        </span>
      )}

      <nav aria-label="Paginación" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          style={{
            ...buttonStyle(false),
            opacity: currentPage === 1 ? 0.5 : 1,
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          Anterior
        </button>

        {getPageNumbers().map((page, index) =>
          typeof page === "string" ? (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              style={{ color: "#71717A", padding: "0 4px" }}
            >
              {page}
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-label={`Ir a página ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              style={buttonStyle(page === currentPage)}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Página siguiente"
          style={{
            ...buttonStyle(false),
            opacity: currentPage === totalPages ? 0.5 : 1,
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}
        >
          Siguiente
        </button>
      </nav>
    </div>
  );
}
