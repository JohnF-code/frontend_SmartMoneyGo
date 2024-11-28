import { useState, useContext } from "react";
import { ClientsContext } from "../contexts/ClientsContext";
import axios from "../config/axios";
import { LoansContext } from "@component/contexts/LoansContext";

const Searcher = ({ setCurrentClients, loan }) => {

  const { clients } = useContext(ClientsContext);

  const { getLoans } = useContext(LoansContext);

  const [search, setSearch] = useState('');

  const handleSearch = async (query) => {
    try {
      if (query !== '') {
        let filtered;

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem('token')}`
          }
        };

        if (loan) {
          const request = await axios('/loans', config);
          const loans = request.data;

          filtered = loans.filter(loan => {
            if (loan.clientId) {
              return (
                loan.clientId.name.toLowerCase().includes(query) ||
                loan.clientId.document.toLowerCase().includes(query)
              );
            }
            return false;
          });
          setCurrentClients(filtered);
          return;
        }

        // Consultar base de datos
        const request = await axios('/clients', config);
        const clients = request.data;

        // Filtrar
        filtered = clients.filter(client => {
          if (client.name && client.document) {
            return (
              client.name.toLowerCase().includes(query) ||
              client.document.includes(query)
            );
          }
          return false;
        });
        setCurrentClients(filtered);
        return;
      }

      // Limpiar Filtros (cuando `query` esté vacío)
      if (loan) {
        const config = {
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('token')}`
          }
        };
        const request = await axios('/loans', config);
        setCurrentClients(request.data);
      } else {
        setCurrentClients(clients);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    handleSearch(query); // Llama a la función de búsqueda en tiempo real
  };

  return (
    <form
      className="w-full sm:col-start-3 lg:col-start-2 col-end-6 mb-5"
      onSubmit={(e) => e.preventDefault()} // Evitar que el formulario haga submit
    >   
      <label
        htmlFor="default-search"
        className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
      >Search</label>
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
        </div>
        <input
          type="search"
          id="default-search"
          className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Buscar Cliente..."
          value={search}
          onChange={handleChange}
        />
      </div>
    </form>
  )
}

export default Searcher;