"use client";
import { useContext, useEffect, useState } from 'react'
import { PaymentsContext } from '@component/contexts/PaymentsContext';
import FilterPayments from '@component/components/FilterPayments';

export default function Page() {
  const paymentsContext = useContext(PaymentsContext);
  const { payments, getPayments } = paymentsContext;

  const [search, setSearch] = useState('');
  const [currentPayments, setCurrentPayments] = useState([]);

  useEffect(() => {
    getPayments();
  }, []);
  
  useEffect(() => {
    setCurrentPayments(payments);
  }, [payments])

  const filterPayments = e => {
    e.preventDefault();
    
    if (search.trim() !== '') {
      const filtered = payments.filter(payment => payment?.clientId?.name.toLowerCase().includes(search) || payment?.clientId?.document.includes(search));

      setCurrentPayments(filtered);
      return;
    }

    setCurrentPayments(payments);
  }

  return (
     <main className="container mx-auto pt-4 px-4 py-16 ">
      <section className="container">
        <h2 className="text-2xl mb-8">
          Pagos Registrados
        </h2>
        <form
          className='py-4 w-full flex'
          onSubmit={filterPayments}
        >
          <input type='text' className='text-lg py-2 px-4 flex-1' placeholder='buscar por nombre o cédula...' onChange={e => setSearch(e.target.value.toLowerCase())}/>
          <button
            type='submit'
            className='py-2 text-lg px-4 bg-cyan-500 text-white font-bold'
          >Buscar Pago</button>
        </form>
        <div style={{ overflowX: 'auto' }}>
          <div className="w-full shadow-lg rounded text-start">
            <FilterPayments
              payments={currentPayments}
              itemsPerPage={50}
            />
          </div>
        </div>
      </section>
    </main>
  )
}