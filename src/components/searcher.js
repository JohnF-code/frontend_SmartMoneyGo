import { useState, useContext } from "react";
import { ClientsContext } from "../contexts/ClientsContext";
import axios from "../config/axios";
import { LoansContext } from "@component/contexts/LoansContext";

const Searcher = ({ setCurrentClients, loan }) => {

  const { clients } = useContext(ClientsContext);

  const { getLoans } = useContext(LoansContext);

  const [search, setSearch] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      if (search !== '') {
        let filtered;

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem('token')}`
          }
        }
        
        if (loan) {
          const request = await axios('/loans', config);
          const loans = request.data;

          filtered = loans.filter(loan => {
            if (loan.clientId) {
              return loan.clientId.name.toLowerCase().includes(search) || loan.clientId.document.toLowerCase().includes(search)
            }
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
            return client.name.toLowerCase().includes(search) || client.document.includes(search) 
          }
        });
        setCurrentClients(filtered);
        return;
      }
      
      // Limpiar Filtros
      getLoans();
      setCurrentClients(clients);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <form
      className="w-full sm:col-start-3 lg:col-start-2 col-end-6 mb-5"
      onSubmit={handleSubmit}
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
          onChange={e => setSearch(e.target.value.toLowerCase())}
        />
        <button
          type="submit"
          className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >Search</button>
      </div>
    </form>
  )
}

export default Searcher;