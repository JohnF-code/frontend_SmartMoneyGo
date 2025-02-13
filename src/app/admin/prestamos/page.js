"use client";
import { useContext, useState, useEffect, Fragment } from 'react'
import { LoansContext } from '@component/contexts/LoansContext';
import { ClientsContext } from '@component/contexts/ClientsContext';
import { AuthContext } from '@component/contexts/AuthContext';
import ModalPayments from '@component/components/modalPayments';
import Searcher from '@component/components/searcher';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowCircleLeft, faArrowLeft, faPen, faTrashCan, faX } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer } from 'react-toastify';
import ModalLoan from '@component/components/modalLoan';
import { formatearFecha, formatearNumero } from '@component/helpers';
import axiosInstance from '../../../config/axios';


export default function Page() {

  const loansContext = useContext(LoansContext);
  const { loans, deleteLoan, getLoans } = loansContext;
  
  const clientsContext = useContext(ClientsContext);
  const { clients, setCurrentClient, getClients } = clientsContext;

  const authContext = useContext(AuthContext)
  const { user } = authContext;
  
  const [showModal, setShowModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentClients, setCurrentClients] = useState([]);
  const [moreInfo, setMoreInfo] = useState(false);
  const [prestamo, setPrestamo] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {  
    getLoans();
  }, [])
  
  useEffect(() => {
    setCurrentClients(paginateClients(loans, currentPage, itemsPerPage));
  }, [loans, currentPage])
  

  const handlePayment = loan => {
    setCurrentClient({
      ...loan.clientId,
      loanId: loan._id,
      installmentValue: loan.installmentValue,
      balance: loan.balance
    })
    setShowPayment(true);
  } 

  let itemsPerPage = 10;

  const totalPages = Math.ceil(loans.length / itemsPerPage);

  // Divide el arreglo de pagos en páginas
  const paginateClients = (payments, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) + (itemsPerPage * (currentPage - 1));
    const endIndex = startIndex + itemsPerPage;
    return payments.slice(startIndex, endIndex);
  };

  const handlePreviousPage = () => {
      setCurrentPage(prevPage => (prevPage > 1 ? prevPage - 1 : prevPage));
  };

  const handleNextPage = () => {
      setCurrentPage(prevPage => (prevPage < totalPages ? prevPage + 1 : prevPage));
  };

  const handlePageChange = (page) => {
      setCurrentPage(page);
  };

// Función para obtener los detalles del pago por el ID del préstamo
const getPaymentByLoanId = async (loanId) => {
  const token = window.localStorage.getItem('token');  // Obtener el token de localStorage
  
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,  // Agregar el token en el encabezado
    }
  };

  try {
    const response = await axiosInstance.get(`/payments?loanId=${loanId}`, config);
    return response.data;  // Retorna los datos de la respuesta
  } catch (error) {
    console.error('Error fetching payment data:', error);
    return null;
  }
};

const selectLoan = async (loan) => {
  // Alternar la visibilidad de más información
  setMoreInfo(!moreInfo);

  // Establecer inmediatamente el préstamo seleccionado (sin latestPayment)
  setPrestamo({ ...loan, latestPayment: null });

  try {
    // Obtener los detalles del pago para el loanId
    const paymentDetails = await getPaymentByLoanId(loan._id);

    let latestPayment = null;

    // Verificar si se obtuvieron los detalles del pago
    if (paymentDetails && paymentDetails.length > 0) {
      // Encontrar el pago con la fecha más reciente
      latestPayment = paymentDetails.reduce((latest, current) => {
        const latestDate = new Date(latest.date);
        const currentDate = new Date(current.date);
        return currentDate > latestDate ? current : latest;
      });
    } else {
      console.log('No se han registrado pagos para este préstamo.');
    }

    // Actualizar el estado del préstamo con el último pago
    setPrestamo({ ...loan, latestPayment });
  } catch (error) {
    console.error('Error al obtener los detalles del pago:', error);
  }
};

  
  const editLoan = loan => {
    console.log('PRESTAMO', loan.clientId._id);
    setSelectedClient(loan.clientId._id);
    setPrestamo(loan);
    setShowModal(true);
  }

  return (
    <>
      <h2 className='text-black dark:text-white text-3xl font-extrabold mb-10 text-center lg:text-start'>Prestamos Activos</h2>

      <div className='mx-auto mb-5'>
        
        <div className='w-[95%] lg:w-auto mx-auto flex flex-col lg:p-5'>
          <div className='flex lg:grid lg:grid-cols-4 sm:gap-2 lg:gap-14'>
            <button
              type='button'
              className='text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font- rounded-lg text-lg px-5 py-2.5 text-center me-2 mb-2 self-start sm:col-span-2 lg:col-span-1'
              onClick={() => setShowModal(true)}>
              Agregar
            </button>
            <Searcher
              setCurrentClients={setCurrentClients}
              loan={true}
            />
          </div>
          <div className="my-2 overflow-x-auto rounded-lg max-w-[95vw] lg:max-w-[70vw] xl:max-w-[80vw] mx-auto lg:mx-4">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden border border-gray-300 dark:border-gray-500 md:rounded-lg">
                <table className='table min-w-full text-start font-light text-surface dark:text-white w-full'>
                  <thead className='border-b border-neutral-200 bg-[#332D2D] font-medium text-white dark:border-white/10'>
                    <tr>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Cliente</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>$</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Descripción</th>
                      {/* <th scope="col" className='px-6 py-4 text-xl font-extrabold'>contacto</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Cedula</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Prestamo</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Interés</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Cuotas</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Saldo</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {loans.length ? 
                       currentClients.map((loan, index) => {
                         const { clientId, description, balance, loanAmount, interest, installments, installmentValue, date, finishDate } = loan;
                         return (
                          <Fragment
                            key={loan._id}
                          >
                            <tr
                              key={loan._id}
                              className="border-b border-neutral-200 dark:border-white/10 hover:bg-white dark:hover:bg-gray-800 cursor-pointer"
                              onClick={() => selectLoan(loan)}
                            >
                               <td className="text-black dark:text-white whitespace-nowrap text-lg  px-6 py-4">{clientId?.name}</td>
                               <td className=''>
                                 <button
                                    type='button'
                                    className='text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2'
                                    onClick={() => handlePayment(loan)}
                                    onDou
                                >$</button>
                              </td>
                               <td className="text-black dark:text-white whitespace-nowrap text-lg  px-6 py-4">{description}</td>
                              {/* <td className="whitespace-nowrap text-lg  px-6 py-4">{((loanAmount * (interest / 100) + loanAmount) / installments).toFixed(2)}</td> */}
                             </tr>
                             {moreInfo && prestamo._id === loan._id ? (
                              <tr className="text-black dark:text-white bg-white justify-start text-start w-full dark:bg-slate-700">
                                <td
                                   colSpan="3"
                                   className="whitespace-nowrap text-lg p-4"
                                >
                                  <p className='mb-2'>Descripción: <span className='font-bold text-lg'>{description}</span></p>
                                  <p className='mb-2'>CC: <span className='font-bold text-lg'>{clientId.document}</span></p>
                                   <p className='mb-2'>Contacto: <span className='font-bold text-lg'>{clientId.contact}</span></p>
                                   <p className='mb-2'>Prestamo: <span className='font-bold text-lg'>{formatearNumero(loanAmount)}</span></p>
                                   <p className='mb-2'>Saldo: <span className='font-bold text-lg'>{formatearNumero(balance)}</span></p>
                                   <p className='mb-2'>Monto de cúota: <span className='font-bold text-lg'>{formatearNumero(installmentValue)}</span></p>
                                   <p className='mb-2'>Cuotas: <span className='font-bold text-lg'>{installments}</span>
                                   </p>
                                  <p className='mb-2'>Interés: <span className='font-bold text-lg'>{interest}%</span></p>
                                   <p className='mb-2'>Fecha: <span className='font-bold text-lg'>{formatearFecha(date)}</span></p>
                                   <p className='mb-2'>Fecha Finalización: <span className='font-bold text-lg'>{formatearFecha(finishDate)}</span></p>
                                   {prestamo.latestPayment ? (
                                  <div>
                                  <p className='mb-2'>Fecha de último Pago: <span className='font-bold text-lg'>{formatearFecha(prestamo.latestPayment.date)}</span></p>
                                  <p className='mb-2'>Monto de último Pago: <span className='font-bold text-lg'>{formatearNumero(prestamo.latestPayment.amount)}</span></p>
                                  </div>
                                  ) : (
                                  <p className='mb-2 text-white font-bold'>No se ha abonado ningún pago para este préstamo.</p>
                                   )}
                                  <button
                                    type='button'
                                    className='text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2'
                                    onClick={() => handlePayment(loan)}
                                  >
                                    Registrar Pago
                                   </button>
                                    {user.role === 'administrador' ?
                                      <button
                                        type='button'
                                        className='text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-full text-base px-4 py-2.5 text-center me-2 mb-2'
                                        onClick={() => editLoan(loan)}
                                      >
                                        <FontAwesomeIcon icon={faPen} />
                                      </button>
                                  : null}
                                   {user.role === 'administrador' ?
                                    <button
                                      type='button'
                                      className='text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-full text-base px-4 py-2.5 text-center me-2 mb-2 '
                                      onClick={() => deleteLoan(loan._id)}
                                    >
                                      <FontAwesomeIcon icon={faTrashCan} />
                                     </button>
                                     : null}
                                   <button
                                      type='button'
                                      className='rounded-full py-2 px-4 font-bold bg-gray-400 text-white'
                                      onClick={() => setMoreInfo(false)}
                                    >
                                      <FontAwesomeIcon icon={faX} />
                                    </button>
                                </td>
                              </tr>
                            ) : ''}
                            
                          </Fragment>
                          
                         )
                       }
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-2 mt-4">
            <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
                Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
                <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded ${
                        currentPage === index + 1
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                >
                    {index + 1}
                </button>
            ))}
            <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
                Next
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal */}
      {showModal ? (
        <ModalLoan
          showLoan={showModal}
          setShowLoan={setShowModal}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          prestamo={prestamo}
          setPrestamo={setPrestamo}
        />
      ) : ''}

      {showPayment ? (
        <ModalPayments
          showPayment={showPayment}
          setShowPayment={setShowPayment}
          setMoreInfo={setMoreInfo}
        />
      ) : ''}

      <ToastContainer />
    </>
  )
}
