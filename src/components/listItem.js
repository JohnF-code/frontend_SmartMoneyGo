import React, { useContext, useState, useEffect } from 'react'
import { calcularDiasAtraso, formatearFecha } from '../helpers';
import { PaymentsContext } from '@component/contexts/PaymentsContext';
    
const ListItem = ({ client, prestamos }) => {
    
    const paymentsContext = useContext(PaymentsContext);
    const { payments, getPayments } = paymentsContext;

    useEffect(() => {
        getPayments();
        console.log('PRESTAMOS', prestamos);
    }, [])
    

    const { _id, name, contact, document } = client;
    
    
    const [panel, setPanel] = useState(false);
    const [atraso, setAtraso] = useState(false);

    const semaforo = (diasAtraso) => {
        if (diasAtraso > 10) {
            if (!atraso) {
                setAtraso(true);
            }
            return (
                <span className='rounded-3xl py-2 px-3 text-sm font-bold text-white bg-red-600'>{diasAtraso} días de atraso</span>
            )
        } else if (diasAtraso > 0) {
            if (!atraso) {
                setAtraso(true);
            }
            return (
                <span className='rounded-3xl py-2 px-3 text-sm font-bold text-white bg-yellow-400'>{diasAtraso} días de atraso</span>
            )
        } else {
            return (
                <span className='rounded-3xl py-2 px-3 text-sm font-bold text-white bg-teal-400'>Puntual</span>
            )
        }
    }

    const getMostRecentPayment = (payments) => {
        if (payments.length === 0) {
            return null; // Retornar null si el arreglo está vacío
        }

        return payments.reduce((objetoMasReciente, objetoActual) => {
            const fechaActual = new Date(objetoActual.date);
            const fechaMasReciente = new Date(objetoMasReciente.date);

            return fechaActual > fechaMasReciente ? objetoActual : objetoMasReciente;
        });
    }

    function calcularTotalPrestado() {
        return prestamos.reduce((total, prestamo) => {
            return total + prestamo.loanAmount;
        }, 0);
    }

  return (
    <li>
        <ul className="flex items-center justify-around accordion border-b border-grey-light hover:bg-gray-100" onClick={() => setPanel(!panel)}>
            <li className="px-3 py-4">
                <span className="bg-white border-2 ml-1 rounded border-gray-400 w-5 h-5 flex flex-shrink-0 focus-within:border-blue-500">
                    <input type="checkbox" className="opacity-0 absolute" />
                    <svg className="fill-current hidden w-4 h-4 text-green-500 pointer-events-none" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                </span>
            </li>
            <li className="inline-flex items-center">
                <span className="py-3 w-40">
                        <p className="text-gray-800 text-sm">{name}</p>
                    <p className="hidden md:table-cell text-xs text-gray-500 font-medium">Nombre</p>
                </span>
            </li>
            <li className="hidden md:table-cell">
                    <p className="text-sm text-gray-800 font-medium">{document}</p>
                <p className="text-xs text-gray-500 font-medium">Identidad</p>
            </li>
            <li className="hidden md:table-cell">
                    <p className="text-sm text-gray-800 font-medium">{contact}</p>
                <p className="text-xs text-gray-500 font-medium">Número telefonico</p>
            </li>
            <li className="hidden md:table-cell">
                    <p className="text-sm text-gray-700 font-medium">{calcularTotalPrestado()}</p>
                    <p className="text-xs text-gray-500 font-medium">Dinero Prestado</p>
            </li>
            <li>
                    {!atraso ?
                        <p className='rounded-3xl py-2 px-3 text-sm font-bold text-white bg-teal-400'>Puntual</p> :
                        <p className='rounded-3xl py-2 px-3 text-sm font-bold text-white bg-amber-500'>Atrasado</p>
                    }
            </li>
        </ul>
        
        {panel ? (
              <ul className={`table-row w-full`}>
                  {
                      prestamos.map((prestamo, index) => {
                        console.log('P9ESTAMOS', prestamos)
                          const currentPayments = payments.filter(payment => payment.loanId?._id === prestamo._id);
                          if (currentPayments.length === 0) return;
                        return (
                            <li
                                className='flex flex-col'
                                key={index}
                            >
                                <h3 className='p-3 text-lg font-black'>
                                    <span className='mr-2'>#{index + 1} Prestamo</span>
                                    {
                                        semaforo(calcularDiasAtraso(prestamo.finishDate, getMostRecentPayment(currentPayments).date))
                                    }
                                </h3>
                                {currentPayments.map((pago, index) => (
                                    <ul
                                        className='flex items-center justify-around w-full'
                                        key={index}
                                    >
                                        <li className='p-3 font-bold'>{formatearFecha(pago.date)}</li>
                                        <li className='p-3'>Valor: <span className='font-bold'>${pago.amount}</span></li>
                                    </ul>
                                ))}
                            </li>
                        )
                    })
                }
            </ul>
        ) : ''}
    </li>
  )
}

export default ListItem