"use client";
import ListItem from '@component/components/listItem';
import { ClientsContext } from '@component/contexts/ClientsContext';
import { LoansContext } from '@component/contexts/LoansContext';
import { useContext, useEffect, useState } from 'react';

export default function Page() {

  const clientsContext = useContext(ClientsContext);
  const { clients } = clientsContext;
  
  const loansContext = useContext(LoansContext);
  const { loans, getLoans } = loansContext;

  const [currentClients, setCurrentClients] = useState([]);

  const [search, setSearch] = useState('');

  useEffect(() => {
    setCurrentClients(clients);
    getLoans(true);
  }, [clients]);

  const filterClients = e => {
    e.preventDefault();
    
    if (search.trim() !== '') {
      const filtered = clients.filter(client => client?.name.toLowerCase().includes(search) || client?.document.includes(search));

      setCurrentClients(filtered);
      return;
    }

    setCurrentClients(clients);
  }

  return (
    <main className="container mx-auto pt-4 px-4 py-16 ">
      <section className="container">
        <h2 className="text-2xl mb-8">
          Historial De Clientes
        </h2>
        <form
          className='py-4 w-full flex'
          onSubmit={filterClients}
        >
          <input type='text' className='text-lg py-2 px-4 flex-1' placeholder='buscar por nombre o cédula...' onChange={e => setSearch(e.target.value.toLowerCase())}/>
          <button
            type='submit'
            className='py-2 text-lg px-4 bg-cyan-500 text-white font-bold'
          >Buscar Cliente</button>
        </form>
        <div style={{ overflowX: 'auto' }}>
          <div className="w-full shadow-lg rounded">
            <ul className="bg-white">
              {clients.length > 0 ?
                currentClients.map(client => {
                  if (loans.some(loan => loan.clientId?._id === client?._id) === false) return; 
                  const currentLoans = loans.filter(loan => loan.clientId?._id === client?._id);
                  return (
                  <ListItem
                    key={client.document}
                    client={client}
                    prestamos={currentLoans}
                  />
                )
                }
              ) : ''}
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}