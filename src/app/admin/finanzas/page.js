"use client";
import React, { useState, useContext, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { PaymentsContext } from '@component/contexts/PaymentsContext'
import { ClientsContext } from '@component/contexts/ClientsContext'
import { AuthContext } from '@component/contexts/AuthContext'
import { agruparPagosPorCliente, calcularMontoNoRecaudado, calcPagosPendientesHoy, monthCreatedLoans, calclMonthPayments, calcPostPayments, agruparPagosPorMes, contarImpagosPorMes, formatearFecha } from '@component/helpers/'
import GraficaDePagos from '@component/components/GraficaDePagos'
import ModalCapital from '@component/components/modalCapital'
import Statistics from '@component/components/statics'
import { ToastContainer } from 'react-toastify';
import { LoansContext } from '@component/contexts/LoansContext';
import ModalTomorrow from '@component/components/modalTomorrow';
import ModalPendingPayments from '@component/components/modalPendingPayments';
import TodayPaymentsModal from '@component/components/todayPaymentsModal';
import ModalBill from '@component/components/modalBill';
import ModalWidthdrawal from '@component/components/modalWidthdrawal';
import { BillsContext } from '@component/contexts/BillsContext';
import { WithdrawalContext } from '@component/contexts/WithdrawalContext';

export default function Finanzas() {

    const paymentsContext = useContext(PaymentsContext);
    const { getPayments, getCapital, capital, payments } = paymentsContext;
    const { bills } = useContext(BillsContext);
    const { withdrawals } = useContext(WithdrawalContext);

    const loansContext = useContext(LoansContext);
    const { loans, getLoans } = loansContext;

    const clientsContext = useContext(ClientsContext);
    const { clients } = clientsContext;

    const authContext = useContext(AuthContext);
    const { user } = authContext;
    
    const [clientes, setClientes] = useState([]);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [todayPayments, setTodayPayments] = useState([]);
    const [pagosPorMes, setPagosPorMes] = useState([]);
    const [impagos, setImpagos] = useState([]);
    
    // Modal State
    const [showModalTomorrow, setShowModalTomorrow] = useState(false);
    const [showPending, setShowPending] = useState(false);
    const [showTodayModal, setShowTodayModal] = useState(false);

    // Modals
    const [showModalCapital, setShowModalCapital] = useState(false);
    const [showModalBill, setShowModalBill] = useState(false);
    const [showModalWidthdraw, setShowModalWidthdraw] = useState(false);

    useEffect(() => {
        const getClients = async () => {
            try {
                const paymentsPromise = await getPayments();
                await getLoans(true);
                await getCapital();
                const pagosAgrupados = await agruparPagosPorCliente(paymentsPromise, loans);
                setClientes(pagosAgrupados);

                // Obtener pagos pendientes hoy
                const pagosPendientes = calcPagosPendientesHoy(pagosAgrupados);
                setPendingPayments(pagosPendientes);

                // Obtener pagos realizados hoy
                paymentsToday(paymentsPromise);

                // Obtener pagos agrupados por mes
                const monthPayments = agruparPagosPorMes(payments);
                setPagosPorMes(monthPayments);

                // Obtener impagos agrupados por mes
                const impagosPorMes = contarImpagosPorMes(pagosAgrupados);
                setImpagos(impagosPorMes);
            } catch (error) {
                console.log(error);
            }
        }

        getClients();
    }, [])

    const amountPendingPayments = () => {
        return pendingPayments.reduce((total, payment) => payment.montoPendiente + total, 0);
    }

    const tomorrowPayments = () => {
        return loans.reduce((total, loan) => loan.installmentValue + total, 0);
    }

    const paymentsToday = (payments) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const today = payments.filter(payment => {
            const paymentDate = new Date(payment.date);
            paymentDate.setHours(0, 0, 0, 0);
            console.log(paymentDate, '====>', hoy);
            return paymentDate.getTime() === hoy.getTime()
        });

        setTodayPayments(today);
        console.log('HOLL',today);
    }

    const raisedMoneyToday = () => {
        return todayPayments.reduce((total, payment) => payment.amount + total, 0);
    }

    const createdLoansToday = () => {
        // Guardar la fecha de hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Obtener prestamos de hoy
        const filtered = loans.filter(loan => {
            const loanDate = new Date(loan.date);
            loanDate.setHours(0, 0, 0, 0);

            // Si coincide con la fecha de hoy, agregar
            return loanDate.toDateString() === hoy.toDateString()
        });

        return filtered;
    }

    const agruparPorDia = (items) => {
        let orderByDay = {};
        const orderItems = items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (let i = 0; i < orderItems.length; i++) {
            const paymentDate = new Date(orderItems[i].date);
            paymentDate.setHours(0, 0, 0, 0);

            const date = formatearFecha(paymentDate);

            let copia = [];

            if (orderByDay[date]?.length) {
                copia = orderByDay[date];
            }
            
            orderByDay = {
                ...orderByDay,
                [date] : [orderItems[i], ...copia]
            }
        };

        return orderByDay;
    }

    // totalSaldo = 0;

    // agruparPagosPorDia
    // agruparPrestamosPorDia

    // whilee diasTranscurridos
    //     saldoHoy = recaudo - prestamos
    //     totalSaldo += saldoHoy

    const totalRetiros = () => {
        return withdrawals.reduce((total, current) => current.amount + total, 0);
      }

    const totalBills = () => {
        return bills.reduce((total, current) => current.amount + total, 0);
      }

    const capitalInvertido = () => {
        return capital.reduce((total, current) => current.capital + total, 0);
      }

    const totalPayments = () => {
        return payments.reduce((total, payment) => payment.amount + total, 0);
      } 

    const calcSaldoCaja = () => {
        const prestado = loans.reduce((total, prestamo) => {
            return total + prestamo.loanAmount;
          }, 0);
          const saldo = capitalInvertido() - prestado - totalBills() + totalPayments() - totalRetiros();
        return saldo;
    }

  return (
      <div className='container max-w-[95%] sm:max-w-full mx-auto'>
          <h2 className='text-black dark:text-white text-3xl mb-8 font-extrabold'>Finanzas</h2>
          
          {user.role === 'administrador' || user.role === 'finanzas' ?
              <Statistics
                  capital={capital}
                  payments={payments}
              />
          : null}

          {user.role === 'administrador' ?
            <div className='flex mb-8'>
              <button
                  type="button"
                  className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-xl px-5 py-3 text-center me-2 mb-2"
                  onClick={() => setShowModalCapital(true)}
              >
                  Añadir capital
                  <FontAwesomeIcon icon={faPlus} className='ml-2'/>
              </button>
              
              <button
                  type="button"
                  className="text-white bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-700 shadow-lg shadow-yellow-500/50 dark:shadow-lg dark:shadow-yellow-700/80 font-medium rounded-lg text-xl px-5 py-3 text-center me-2 mb-2"
                  onClick={() => setShowModalBill(true)}
              >
                  Añadir Gastos
                  <FontAwesomeIcon icon={faPlus} className='ml-2'/>
              </button>
              
              <button
                type="button"
                className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-700 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-700/80 font-medium rounded-lg text-xl px-5 py-3 text-center me-2 mb-2"
                onClick={() => setShowModalWidthdraw(true)}
              >
                  Añadir Retiro
                  <FontAwesomeIcon icon={faPlus} className='ml-2'/>
              </button>
            </div>
          : ''}

          <main className='flex flex-col lg:flex-row gap-x-5 mx-auto'>
            <div className='flex flex-col mb-6'>
                <div className='mb-2 bg-white rounded-2xl p-4 min-w-24 dark:bg-slate-900'>
                    <h4 className='text-black dark:text-white text-lg font-bold border-b-2 border-slate-300'>Resúmen de hoy</h4>
                    <div className='grid grid-cols-2'>
                          <button
                            type='button'
                            className='p-2 text-start cursor-pointer rounded-md hover:bg-slate-100 dark:hover:bg-blue-700'
                            onClick={() => setShowPending(true)}
                          >
                            <span className='text-slate-500 dark:text-slate-300 text-sm'>Pagos pendientes hoy</span>
                              <p className='text-black dark:text-white font-bold text-lg'>$
                                  {parseInt(amountPendingPayments())}
                              </p>  
                        </button>
                          <button
                              type='button'
                              className='p-2 text-start rounded-md hover:bg-slate-100 dark:hover:bg-blue-700 cursor-pointer'
                              onClick={() => setShowModalTomorrow(true)}
                          >
                            <span className='text-slate-500 dark:text-slate-300 text-sm'>Pendientes mañana</span>
                              <p className='text-black dark:text-white font-bold text-lg'>${parseInt(tomorrowPayments())}</p>  
                          </button>
                          <button
                            type='button'
                            className='p-2 text-start rounded-md hover:bg-slate-100 dark:hover:bg-blue-700 cursor-pointer'
                            onClick={() => setShowTodayModal(true)}
                          >
                            <span className='text-slate-500 dark:text-slate-300 text-sm'>Recaudo hoy</span>
                              <p className='text-black dark:text-white font-bold text-lg'>${parseInt(raisedMoneyToday())}</p>  
                          </button>
                          <div
                            className='text-start p-2 rounded-md hover:bg-slate-100 dark:hover:bg-blue-700 cursor-pointer'
                          >
                            <span className='text-slate-500 dark:text-slate-300 text-sm'>Saldo Caja</span>
                            <p className='text-black dark:text-white font-bold text-lg'>${parseInt(calcSaldoCaja())}</p>
                          </div>
                          <div className='p-2'>
                            <span className='text-slate-500 dark:text-slate-300 text-sm'>Registrados hoy</span>
                              <p className='text-black dark:text-white font-bold text-lg'>{todayPayments.length}</p>  
                          </div>
                    </div>
                </div>
                {user.role === 'finanzas' || user.role === 'administrador' ?
                    <div className='bg-white rounded-2xl p-4 dark:bg-slate-900'>
                        <h4 className='text-lg font-bold border-b-2 border-slate-300 text-black dark:text-white'>Resúmen del mes</h4>
                        <div className='grid grid-cols-2'>
                            <div className='p-2'>
                                <span className='text-slate-500 text-sm'>Dinero Recaudado</span>
                                <p className='text-black dark:text-white font-bold text-lg'>${calclMonthPayments(payments)}</p>  
                            </div>
                            <div className='p-2'>
                                <span className='text-slate-500 text-sm'>Prestamos Creados</span>
                                <p className='text-black dark:text-white font-bold text-lg'>{monthCreatedLoans(loans)}</p>  
                            </div>
                            <div className='p-2'>
                                <span className='text-slate-500 text-sm'>Impagos</span>
                                <p className='text-black dark:text-white font-bold text-lg'>{parseInt(calcularMontoNoRecaudado(clientes))}</p>  
                            </div>
                            <div className='p-2'>
                                <span className='text-slate-500 text-sm'>Pagos registrados en el mes</span>
                                <p className='text-black dark:text-white font-bold text-lg'>{parseInt(calcPostPayments(payments))}</p>  
                            </div>
                        </div>
                    </div>
                : ''}
            </div>
            {user.role === 'administrador' || user.role === 'finanzas' ?
                <div className='flex-col w-full p-4 shadow-sm rounded-lg mb-6'>
                    <GraficaDePagos
                        pagosPorMes={pagosPorMes}
                        impagos={impagos}
                    />
                </div>
            : ''}
          </main>

          {showModalWidthdraw ? (
              <ModalWidthdrawal
                showModal={showModalWidthdraw}
                setShowModal={setShowModalWidthdraw}
              />
          ) : ''}

          {showModalCapital ? (
            <ModalCapital
                showModal={showModalCapital}
                setShowModal={setShowModalCapital}
            />
          ) : ''}

          {showModalBill ? (
            <ModalBill
                showModal={showModalBill}
                setShowModal={setShowModalBill}
            />
          ) : ''}

          {showModalTomorrow ? (
              <ModalTomorrow
                showModal={showModalTomorrow}
                setShowModal={setShowModalTomorrow}
                prestamos={clientes}
              />
          ) : ''}

          {showPending ? (
              <ModalPendingPayments
                showModal={showPending}
                setShowModal={setShowPending}
                prestamos={pendingPayments}
              />
          ) : ''}

          {showTodayModal ? (
              <TodayPaymentsModal
                showModal={showTodayModal}
                setShowModal={setShowTodayModal}
                prestamos={todayPayments}
              />
          ) : ''}

          <ToastContainer />
      </div>
  )
}