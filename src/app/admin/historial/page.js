"use client";
import ListItem from "@component/components/listItem";
import { ClientsContext } from "@component/contexts/ClientsContext";
import { LoansContext } from "@component/contexts/LoansContext";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Importar para manejar redirecciones

export default function Page() {
  const router = useRouter(); // Hook para manejar redirecciones

  // Contextos para clientes y préstamos
  const { clients } = useContext(ClientsContext);
  const { loans, getLoans } = useContext(LoansContext);

  const [currentClients, setCurrentClients] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setCurrentClients(clients);
    getLoans(true); // Cargar préstamos
  }, [clients, getLoans]);

  useEffect(() => {
    filterClients({
      preventDefault: () => {}, // Evitar el comportamiento por defecto
    });
  }, [search]);

  // Filtrar clientes por nombre, cédula o celular
  const filterClients = (e) => {
    e.preventDefault();

    if (search.trim() !== "") {
      const filtered = clients.filter(
        (client) =>
          client?.name.toLowerCase().includes(search) ||
          client?.document.includes(search) ||
          client?.contact.includes(search)
      );

      setCurrentClients(filtered);
      return;
    }

    setCurrentClients(clients);
  };

  // Navegar al historial del cliente al hacer clic en un renglón
  const handleRowClick = (clientId) => {
    router.push(`/admin/historial/${clientId}`); // Redirigir al historial del cliente
  };

  return (
    <main className="container mx-auto pt-4 px-4 py-16">
      <section className="container">
        {/* Título y total de clientes */}
        <h2 className="text-black dark:text-white text-2xl font-extrabold inline-block">
          Historial Del Cliente
        </h2>
        <span className="text-primary text-2xl font-extrabold ml-4">
          {currentClients.length}
        </span>

        {/* Barra de búsqueda */}
        <form
          className="py-4 w-full flex items-center"
          onSubmit={filterClients}
        >
          <div className="relative flex-1">
            <input
              type="text"
              className="rounded-lg text-black dark:text-white text-md py-2 px-4 w-full dark:bg-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Buscar por nombre, cédula o celular..."
              onChange={(e) => setSearch(e.target.value.toLowerCase())}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              🔍
            </span>
          </div>
        </form>

        {/* Tabla de clientes */}
        <div className="overflow-x-auto">
          <div className="w-full shadow-lg rounded">
            <table className="min-w-full text-left bg-white dark:bg-slate-900 rounded-lg">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-2 text-sm font-semibold rounded-tl-lg">
                    Nombre
                  </th>
                  <th className="px-4 py-2 text-sm font-semibold">Cédula</th>
                  <th className="px-4 py-2 text-sm font-semibold">Celular</th>
                  <th className="px-4 py-2 text-sm font-semibold"># Préstamos</th>
                  <th className="px-4 py-2 text-sm font-semibold rounded-tr-lg">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentClients.length > 0 ? (
                  currentClients.map((client) => {
                    // Filtrar préstamos del cliente actual
                    const clientLoans = loans.filter(
                      (loan) => loan.clientId?._id === client?._id
                    );

                    return (
                      <tr
                        key={client._id}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleRowClick(client._id)}
                      >
                        <td className="px-4 py-2 text-sm font-medium text-black dark:text-white">
                          {client.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-black dark:text-white">
                          {client.document}
                        </td>
                        <td className="px-4 py-2 text-sm text-black dark:text-white">
                          {client.contact}
                        </td>
                        <td className="px-4 py-2 text-sm text-black dark:text-white">
                          {clientLoans.length}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {/* Botón de estado */}
                          {clientLoans.some((loan) => loan.status === "atrasado") ? (
                            <span className="text-danger font-bold">Atrasado</span>
                          ) : (
                            <span className="text-green-500 font-bold">Al Día</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-4 text-gray-500 dark:text-gray-400"
                    >
                      No hay clientes para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
