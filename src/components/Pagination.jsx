"use client";

import React from "react";

/**
 * Pagination
 * Muestra paginación en bloques, sin usar "payments".
 *
 * Props:
 * - currentPage (number)
 * - totalPages (number)
 * - onPageChange (func => (pageNum) => void)
 * - blockSize => default 5
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  blockSize = 5,
}) {
  if (totalPages <= 1) return null;

  // Bloque actual
  const pageBlock = Math.floor((currentPage - 1) / blockSize);
  const startPage = pageBlock * blockSize + 1;
  let endPage = startPage + blockSize - 1;
  if (endPage > totalPages) endPage = totalPages;

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePrevPage = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };
  const handlePrevBlock = () => {
    if (pageBlock > 0) {
      onPageChange((pageBlock - 1) * blockSize + 1);
    }
  };
  const handleNextBlock = () => {
    const blocksCount = Math.ceil(totalPages / blockSize);
    if (pageBlock < blocksCount - 1) {
      onPageChange((pageBlock + 1) * blockSize + 1);
    }
  };

  return (
    <div className="flex justify-center items-center mt-4 space-x-2">
      <button
        onClick={handlePrevPage}
        className="px-3 py-1 border border-gray-300 rounded hover:bg-secondary"
      >
        Anterior
      </button>

      {pageBlock > 0 && (
        <button
          onClick={handlePrevBlock}
          className="px-3 py-1 border border-gray-300 rounded hover:bg-secondary"
        >
          ...
        </button>
      )}

      {pages.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`px-3 py-1 border border-gray-300 rounded hover:bg-secondary ${
            currentPage === num ? "bg-primary text-white" : ""
          }`}
        >
          {num}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          <button
            onClick={handleNextBlock}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-secondary"
          >
            ...
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            className={`px-3 py-1 border border-gray-300 rounded hover:bg-secondary ${
              currentPage === totalPages ? "bg-primary text-white" : ""
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={handleNextPage}
        className="px-3 py-1 border border-gray-300 rounded hover:bg-secondary"
      >
        Siguiente
      </button>
    </div>
  );
}
