"use client";
// src/components/Dashboard.js
import { useState, useContext, useEffect } from 'react';
import Statistics from '@component/components/statics.js';
import Chart from '@component/components/chart';
import PieChart from '@component/components/pieChart.js';
import BarChart from '@component/components/barChart.js';
import { PaymentsContext } from '@component/contexts/PaymentsContext';
import { ClientsContext } from '@component/contexts/ClientsContext';
import { calculateMonthlyEarnings, calculateNetMonthlyEarnings, calculateDailyGrossEarningsLast7Days, calculateDailyNetEarningsLast7Days, calculateLoansPerMonth } from '@component/helpers/';
import Link from 'next/link';
import Image from 'next/image';

export default function Page() {

  const paymentsContext = useContext(PaymentsContext);
  const { getPayments, getCapital, capital, payments } = paymentsContext;

  const clientsContext = useContext(ClientsContext);
  const { clients, getClients } = clientsContext;
  
  const [montlyEarnings, setMontlyEarnings] = useState([]);
  const [netMontlyEarnings, setNetMontlyEarnings] = useState([]);
  
  const [dailyGrossEarnings, setDailyGrossEarnings] = useState([]);
  const [dailyNetEarnings, setDailyNetEarnings] = useState([]);
  
  const [loansPerMonth, setLoansPerMonth] = useState({});
  
  useEffect(() => {
    const get = async () => {
      await getPayments();
      await getCapital();
      await getClients(true);
    }

    get();
  }, [])
  
  useEffect(() => {
    setNetMontlyEarnings(calculateNetMonthlyEarnings(payments, capital));
    setMontlyEarnings(calculateMonthlyEarnings(payments));
    setDailyGrossEarnings(calculateDailyGrossEarningsLast7Days(payments));
    setDailyNetEarnings(calculateDailyNetEarningsLast7Days(payments, capital))
    setLoansPerMonth(calculateLoansPerMonth(clients));
  }, [payments, capital])
  
    
  return (
    <div className='max-w-[95%] lg:max-w-full mx-auto'>
      <h2 className='text-3xl mb-8'>Dashboard</h2>
      <Link
        href={'/admin/prestamos'}
        className='inline-block p-4 bg-amber-400 mb-10 text-2xl rounded-lg hover:border-4 hover:border-amber-200 font-bold text-white hover:bg-amber-500'
      >
        <Image
          src={'/paid_2.svg'}
          alt='Imagen Pagos'
          width={35}
          height={35}
          className='inline-block mr-2'
        />
        Pagos Pendientes
      </Link>
      
      <Statistics
        capital={capital}
        payments={payments}
      />

      <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start">
        <div className='flex-1'>
          <Chart
            netEarnings={netMontlyEarnings}
            grossEarnings={montlyEarnings}
            title={'Ganancias Mensuales'}
          />

          <BarChart
            data={loansPerMonth}
          />
        </div>
        <div className='grid gris-cols-1 gap-6'>
          <Chart
            netEarnings={dailyNetEarnings}
            grossEarnings={dailyGrossEarnings}
            title={'Ganancias Diarias'}
          />
          <PieChart
            capital={capital}
          />
        </div>
      </div>
    </div>
  );
};