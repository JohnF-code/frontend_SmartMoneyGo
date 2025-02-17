"use client";

import { useState, useEffect } from "react";

/**
 * Searcher
 * - Recibe `clients` (arreglo de clientes) y `setCurrentClients` (para actualizar el listado que se muestra).
 * - Filtra localmente por name, document, contact, sin hacer requests adicionales.
 */
export default function Searcher({
  clients = [],             // lista de clientes que ya tienes en el padre
  setCurrentClients,        // callback para actualizar la lista que se muestra
  placeholder = "Buscar por nombre, cédula o teléfono...",
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Cada vez que cambie la lista de clients proveniente del padre,
  // restablecemos la búsqueda.
  useEffect(() => {
    // Si no hay término de búsqueda, mostramos todo
    if (!searchTerm.trim()) {
      setCurrentClients(clients);
    } else {
      // Volvemos a filtrar con la query actual
      filtrar(searchTerm, clients);
    }
  }, [clients]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cada vez que tecleamos, filtra localmente
  function handleChange(e) {
    const valor = e.target.value;
    setSearchTerm(valor);

    if (!valor.trim()) {
      // Si está vacío, mostrar todos
      setCurrentClients(clients);
      return;
    }
    filtrar(valor, clients);
  }

  // Función de filtrado
  function filtrar(query, data) {
    const lower = query.toLowerCase();
    const filtrado = data.filter((cli) => {
      const name = cli.name?.toLowerCase() || "";
      const doc = String(cli.document || "").toLowerCase();
      const contact = String(cli.contact || "").toLowerCase();
      return (
        name.includes(lower) ||
        doc.includes(lower) ||
        contact.includes(lower)
      );
    });
    setCurrentClients(filtrado);
  }

  return (
    <div className="relative w-full mb-4">
      <div className="relative">
        {/* Ícono de búsqueda */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        {/* Input */}
        <input
          type="search"
          className="
            block w-full p-4 pl-10 text-sm text-gray-900
            border border-gray-300 rounded-lg bg-gray-50
            focus:ring-[#2BD6B1] focus:border-[#2BD6B1]
            dark:bg-gray-700 dark:border-gray-600
            dark:placeholder-gray-400 dark:text-white
            dark:focus:ring-[#2BD6B1] dark:focus:border-[#2BD6B1]
          "
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
