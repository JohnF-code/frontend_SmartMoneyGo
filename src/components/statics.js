// src/components/Statistics.js
import { useContext, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSackDollar, faDollarSign, faMoneyBillTrendUp, faMoneyBill, faHandHoldingDollar, faCreditCard, faCoins, faMoneyCheckDollar, faChartLine, faMoneyBillTransfer, faUsers, faUser, faMoneyBill1, faCircleUser } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import CapitalList from './capitalList';
import { LoansContext } from '@component/contexts/LoansContext';
import { BillsContext } from '@component/contexts/BillsContext';
import ModalBill from './modalBill';
import { WithdrawalContext } from '@component/contexts/WithdrawalContext';
import { ClientsContext } from '@component/contexts/ClientsContext';

const Statistics = ({ capital, payments }) => {

  const { loans, getLoans } = useContext(LoansContext);
  const { bills } = useContext(BillsContext);
  const { withdrawals } = useContext(WithdrawalContext);
  const { clients } = useContext(ClientsContext);

  const [interest, setInterest] = useState(0);

  useEffect(() => {
    getLoans(true);
  }, [])
  
  

  const capitalInvertido = () => {
    return capital.reduce((total, current) => current.capital + total, 0);
  }

  const totalBills = () => {
    return bills.reduce((total, current) => current.amount + total, 0);
  }

  const totalRetiros = () => {
    return withdrawals.reduce((total, current) => current.amount + total, 0);
  }
  
  const totalPayments = () => {
    return payments.reduce((total, payment) => payment.amount + total, 0);
  } 

  const totalCapital = () => {
    return capitalInvertido() + totalGanancias() - totalBills();
  }
  
  const totalGanancias = () => {
    const earnings = loans.reduce((total, loan) => {
      const prestado = loan.installments * loan.installmentValue;
      const interes = prestado * loan.interest / 100;
      return total + interes;
    }, 0);

    return earnings;
  }

  const capitalDisponible = () => {
    const disponible = capitalInvertido() - totalPrestamos() - totalBills() + totalPayments() - totalRetiros();
    return disponible;
  }

  const gananciasDisponibles = () => {
    return totalGanancias() - totalRetiros();
  }

  const totalPrestamos = () => {
    const prestamos = loans.reduce((total, loan) => {
      const prestado = loan.installments * loan.installmentValue;
      return prestado + total;
    }, 0);
    return prestamos;
  }

  const [showModalCapital, setShowModalCapital] = useState(false);
  const [showModalBill, setShowModalBill] = useState(false);
  const [showModalWithdraw, setShowModalWithdraw] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 max-w-[95%] sm:max-w-full mx-auto">
        <button
          type='button'
          className='flex gap-5 p-4 rounded-xl hover:transform hover:scale-110 hover:border-slate-300 hover:border-4'
          onClick={() => setShowModalCapital(true)}
          style={{backgroundColor: '#1efff026'}}
        >
          <FontAwesomeIcon icon={faSackDollar} className='text-5xl lg:text-7xl text-violet-600' />
            <div>
              <h3 className='text-sm font-light'>Total Capital Invertido</h3>
              <p className='font-bold text-2xl xl:text-3xl'>{capitalInvertido()}</p>
            </div>
        </button>
        <button
          type='button'
          className='flex gap-5 p-4 rounded-xl hover:transform hover:scale-110 hover:border-slate-300 hover:border-4'
          onClick={() => setShowModalBill(true)}
          style={{backgroundColor: '#1efff026'}}
        >
          <FontAwesomeIcon icon={faCreditCard} className='text-5xl lg:text-7xl text-yellow-500' />
          <div>
            <h3 className='text-sm font-light'>Total Gastos</h3>
            <p className='font-bold text-2xl xl:text-3xl'>{totalBills()}</p>
          </div>
        </button>
        <button
          type='button'
          className='flex gap-5 p-4 rounded-xl hover:transform hover:scale-110 hover:border-slate-300 hover:border-4'
          onClick={() => setShowModalWithdraw(true)}
          style={{backgroundColor: '#1efff026'}}
        >
          <FontAwesomeIcon icon={faHandHoldingDollar} className='text-5xl lg:text-7xl text-green-600' />
            <div>
              <h3 className='text-sm font-light'>Total Retiros</h3>
              <p className='font-bold text-2xl xl:text-3xl'>{totalRetiros()}</p>
            </div>
        </button>
        <div
          className='flex gap-5 p-4 rounded-xl'
          style={{ backgroundColor: '#00ccff29' }}
        >
          <FontAwesomeIcon icon={faCoins} className='text-5xl lg:text-7xl text-violet-600' />
            <div>
              <h3 className='text-sm font-light'>Total Capital</h3>
              <p className='font-bold text-2xl xl:text-3xl'>{parseInt(totalCapital())}</p>
            </div>
        </div>
        <Link
          href={'/admin/pagos'}
          className='flex gap-5 p-4 rounded-xl hover:transform hover:scale-110 hover:border-slate-300 hover:border-4'
          style={{ backgroundColor: '#00ccff29' }}
        >
          <FontAwesomeIcon icon={faDollarSign} className='text-5xl lg:text-7xl text-blue-500' />
          <div>
              <h3 className='text-sm font-light'>Total Facturado</h3>
              <p className='font-bold text-2xl xl:text-3xl'>{totalPayments()}</p>
          </div>
        </Link>
        <div
          className='flex gap-5 bg-cyan-100 p-4 rounded-xl'
          style={{ backgroundColor: '#00ccff29' }}
        >
          <FontAwesomeIcon icon={faMoneyBillTrendUp} className='text-5xl lg:text-7xl text-blue-500' />
          <div>
              <h3 className='text-sm font-light'>Ganancias</h3>
              <p className='font-bold text-2xl xl:text-3xl'>{parseInt(totalGanancias())}</p>
          </div>
        </div>
        <div
          className='flex gap-5 p-4 rounded-xl'
          style={{backgroundColor: '#d200ff14'}}
        >
          <FontAwesomeIcon icon={faMoneyBillTransfer} className='text-5xl lg:text-7xl text-blue-500' />
          <div>
            <h3 className='text-sm font-light'>Total Prestamos</h3>
            <p className='font-bold text-2xl xl:text-3xl'>{parseInt(totalPrestamos())}</p>
          </div>
        </div>
        <div
          className='flex gap-5 p-4 rounded-xl'
          style={{backgroundColor: '#d200ff14'}}
        >
          <FontAwesomeIcon icon={faMoneyCheckDollar} className='text-5xl lg:text-7xl text-violet-600' />
          <div>
              <h3 className='text-sm font-light'>Capital Disponible</h3>
              <p className='font-bold text-2xl xl:text-3xl'>{parseInt(capitalDisponible())}</p>
          </div>
        </div>
        <div
          style={{backgroundColor: '#d200ff14'}}
          className='flex gap-5 p-4 rounded-xl'
        >
          <FontAwesomeIcon icon={faChartLine} className='text-5xl lg:text-7xl text-blue-500' />
          <div>
              <h3 className='text-sm font-light'>Ganancias Disponibles</h3>
              <p className='font-bold text-2xl xl:text-3xl'>{parseInt(gananciasDisponibles())}</p>
          </div>
        </div>
      </div>

      <div
        className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 max-w-[95%] sm:max-w-full mx-auto'
      >
        <Link
          href={'/admin/clientes'}
          className='flex gap-5 p-4 rounded-xl hover:transform hover:scale-110 hover:border-slate-300 hover:border-4'
          style={{backgroundColor: '#d200ff14'}}
        >
          <FontAwesomeIcon icon={faCircleUser} className='text-5xl lg:text-7xl text-green-600' />
          <div>
              <h3 className='text-sm font-light'>Total Clientes</h3>
            <p className='font-bold text-2xl xl:text-3xl'>{clients.length}</p>
          </div>
        </Link>
        <Link
          className='flex gap-5 bg-white p-4 rounded-xl hover:transform hover:scale-110 hover:border-slate-300 hover:border-4'
          href={'/admin/prestamos'}
          style={{backgroundColor: '#d200ff14'}}
        >
          <FontAwesomeIcon icon={faMoneyBill1} className='text-5xl lg:text-7xl text-green-600' />
          <div>
              <h3 className='text-sm font-light'>Total Prestamos</h3>
            <p className='font-bold text-2xl xl:text-3xl'>{loans.length}</p>
          </div>
        </Link>
      </div>

      {showModalCapital && (
        <CapitalList
          showModal={showModalCapital}
          setShowModal={setShowModalCapital}
          capital={capital}
        />
      )}

      {showModalBill && (
        <CapitalList
          showModal={showModalBill}
          setShowModal={setShowModalBill}
          bills={bills}
        />
      )}

      {showModalWithdraw && (
        <CapitalList
          showModal={showModalWithdraw}
          setShowModal={setShowModalWithdraw}
          withdrawals={withdrawals}
        />
      )}
    </>
  );
};

export default Statistics;
