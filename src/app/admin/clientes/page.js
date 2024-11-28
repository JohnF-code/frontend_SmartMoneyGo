"use client";
import { useContext, useState, useEffect, Fragment } from 'react'
import ModalClient from '@component/components/modalClient';
import ModalLoan from '@component/components/modalLoan';
import ModalInfo from '@component/components/ModalInfo';
import { ClientsContext } from '@component/contexts/ClientsContext';
import { AuthContext } from '@component/contexts/AuthContext';
import ModalPayments from '@component/components/modalPayments';
import Searcher from '@component/components/searcher';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faEye, faPen, faPlus } from '@fortawesome/free-solid-svg-icons'
import { ToastContainer } from 'react-toastify';
import axios from '@component/config/axios';
import { formatearFecha } from '@component/helpers';


export default function Page() {

  const clientsContext = useContext(ClientsContext);
  const { clients, deleteClient, getClients } = clientsContext;

  const authContext = useContext(AuthContext)
  const { user } = authContext;
  
  const [showModal, setShowModal] = useState(false);
  const [showLoan, setShowLoan] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedClient, setSelectedClient] = useState({});
  const [currentClients, setCurrentClients] = useState([]);
  const [loan, setLoan] = useState({});
  const [client, setClient] = useState({});
  const [showInfo, setShowInfo] = useState(false);
  const [moreInfo, setMoreInfo] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    getClients();
  }, []);

    let itemsPerPage = 50;

    const totalPages = Math.ceil(clients.length / itemsPerPage);
    
    useEffect(() => {
      setCurrentClients(paginateClients(clients, currentPage, itemsPerPage));
    }, [currentPage, clients]);

    // Divide el arreglo de pagos en páginas
    const paginateClients = (clients, currentPage, itemsPerPage) => {
      const startIndex = (currentPage - 1) + (itemsPerPage * (currentPage - 1));
      const endIndex = startIndex + itemsPerPage;
      return clients.slice(startIndex, endIndex);
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

  const showModalInfo = async (client) => {
    // setShowInfo(true);
    const token = window.localStorage.getItem('token');
    const config = {
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
      }
    }
    const loans = await axios(`/loans/${client._id}`, config);
    setLoan(loans.data);
    setClient(client);
    setShowInfo(true);
  }

  const handleEdit = client => {
    setClient(client);
    setShowModal(true);
  }

  const cleanClient = () => {
    setClient({});
  }

  const selectClient = client => {
    setMoreInfo(!moreInfo);
    setClient(client);
    console.log(client);
    // const { name, document, contact, coordinates, date } = client;
  }
  
  return (
    <>
      <h2 className='text-black dark:text-white text-3xl font-extrabold mb-10 text-center lg:text-start'>Lista de Clientes</h2>

      <div className='mx-auto mb-5'>
        <div className='w-[95%] lg:w-auto mx-auto flex flex-col lg:p-5'>
          <Searcher
            setCurrentClients={setCurrentClients}
          />
          <button
            type='button'
            className='text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font- rounded-lg text-lg px-5 py-2.5 text-center me-2 mb-2 self-start sm:col-span-2 lg:col-span-1'
            onClick={() => {
              setClient({});
              setShowModal(true)
            }}>
            Agregar
          </button>
          
          <div className="my-2 overflow-x-auto rounded-lg max-w-[95vw] lg:max-w-[70vw] xl:max-w-[80vw] lg:mx-4">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden border border-gray-300 dark:border-gray-500 md:rounded-lg">
                <table className='table min-w-full text-start font-light text-surface dark:text-white w-full'>
                  <thead className='border-b border-neutral-200 bg-[#332D2D] font-medium text-white dark:border-white/10'>
                    <tr>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>#</th>
                      {/* <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Acciones</th> */}
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Nombre</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold hidden md:block'>Cedula</th>
                      {/* <th scope="col" className='px-6 py-4 text-xl font-extrabold'>contacto</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Cedula</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Prestamo</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Interés</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Cuotas</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Saldo</th> */}
                      {/* <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Saldo</th>
                      <th scope="col" className='px-6 py-4 text-xl font-extrabold'>Valor de cuota</th> */}
                        
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length ? 
                       currentClients.map((cliente, index) => {
                        const { name, document } = cliente;
                        return (
                          <Fragment
                            key={index}
                          >
                            <tr
                              className="border-b border-neutral-200 dark:border-white/10 hover:bg-white dark:hover:bg-gray-800 cursor-pointer"
                              onClick={() => selectClient(cliente)}
                              key={index}
                            >
                              <td className="text-black dark:text-white whitespace-nowrap text-lg  px-6 py-4 font-extrabold">{index}</td>

                              <td className="text-black dark:text-white whitespace-nowrap text-lg px-6 py-4">{name}</td>
                              <td className="text-black dark:text-white whitespace-nowrap text-lg  px-6 py-4 hidden md:block">{document}</td>
                            </tr>
                            {moreInfo && client._id === cliente._id ? (
                              <tr
                                className="text-black dark:text-white bg-white dark:bg-slate-700 justify-start text-start w-full"
                              >
                                <td colSpan="3" className="whitespace-nowrap text-lg p-4">
                                   <p className='mb-2'>Nombre: <span className='font-bold text-lg'>{client.name}</span></p>
                                    <p className='mb-2'>CC: <span className='font-bold text-lg'>{client.document}</span></p>
                                    <p className='mb-2'>Contacto: <span className='font-bold text-lg'>{client.contact}</span></p>
                                    <p className='mb-2'>Fecha: <span className='font-bold text-lg'>{formatearFecha(client.date)}</span></p>
                                  {/* <button
                                    type='button'
                                    className='text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2'
                                    onClick={() => handlePayment(client)}
                                  >
                                    Registrar Pago
                                  </button> */}
                                  <button
                                    type='button'
                                    className='text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-xl text-sm px-5 py-3 text-center me-2 mb-2 items-center flex-col justify-center'
                                    onClick={() => {
                                      setShowLoan(true)
                                      setSelectedClient(client._id)
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faPlus} className='text-lg mr-2'/>
                                    PRESTAMO
                                  </button>
                                  <button
                                    type="button"
                                    className="text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-xl text-base px-5 py-2.5 text-center me-2 mb-2"
                                    onClick={() => showModalInfo(client)}
                                  >
                                    <FontAwesomeIcon
                                        icon={faEye}
                                    />
                                  </button>
                                  {user.role === 'administrador' ?
                                    <button
                                    type="button"
                                    className="text-white bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 hover:bg-gradient-to-br focus:ring-4 font-medium rounded-xl text-base px-5 py-2.5 text-center me-2 mb-2"
                                    onClick={() => handleEdit(client)}
                                  >
                                    <FontAwesomeIcon
                                        icon={faPen}
                                    />
                                  </button>
                                  : ''}
                                  {user.role === 'administrador' ?
                                    <button
                                      type='button'
                                      className='text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-xl text-base px-4 py-2.5 text-center me-2 mb-2 '
                                      onClick={() => deleteClient(client._id)}
                                    >
                                      <FontAwesomeIcon icon={faTrashCan} />
                                    </button>
                                  : null}
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
      {showModal && (
        <ModalClient
          showModal={showModal}
          setShowModal={setShowModal}
          client={client}
          cleanClient={cleanClient}
        />
      )}

      {showPayment ? (
        <ModalPayments
          showPayment={showPayment}
          setShowPayment={setShowPayment}
        />
      ) : ''}
      
      {showLoan ? (
        <ModalLoan
          showLoan={showLoan}
          setShowLoan={setShowLoan}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          setPrestamo={() => {}}
        />
      ) : ''}

      {showInfo ? (
        <ModalInfo
          loan={loan}
          client={client}
          showInfo={showInfo}
          setShowInfo={setShowInfo}
          selectedClient={selectedClient}
        />
      ) : ''}

      <ToastContainer />
    </>
  )
}
