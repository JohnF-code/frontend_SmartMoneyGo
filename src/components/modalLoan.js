import { Fragment, useState, useContext } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { LoansContext } from '../contexts/LoansContext'
import { ClientsContext } from '@component/contexts/ClientsContext';
import { toast } from 'react-toastify';
import { calculateEndDate, formatearFecha } from '../helpers';


const ModalLoan = ({ showLoan, setShowLoan, selectedClient, setSelectedClient, prestamo, setPrestamo }) => {
    
    // Context State
    const loansContext = useContext(LoansContext);
    const { addLoan, updateLoan } = loansContext;

    // Context State
    const clientsContext = useContext(ClientsContext);
    const {  clients } = clientsContext;
    
    // State
    const [loan, setLoan] = useState({
        description: prestamo?.description || '',
        loanAmount: prestamo?.loanAmount?.toString() || '',
        interest: prestamo?.interest?.toString() || '',
        installments: prestamo?.installments?.toString() || '',
        date: new Date(prestamo?.date).getTime() || Date.now(),
        clientId: prestamo?.clientId || selectedClient
    });
    const [client, setClient] = useState({});
    const [alert, showAlert] = useState(false);
    const [message, setMessage] = useState('');
    const [document, setDocument] = useState('');
    const [showForm, setShowForm] = useState(selectedClient);

    const handleChange = e =>  {
        setLoan({ ...loan, [e.target.name]: e.target.value });
    }

    const handleSubmit = async e => {
        e.preventDefault();

        // Validation
        const { loanAmount, interest, installments } = loan;
        if (loanAmount.trim() === '' || interest.trim() === '' || installments.trim() === '') {
            setMessage('Todos los campos son obligatorios')
            showAlert(true);
            setTimeout(() => {
                showAlert(false);
            }, 3000);
            return;
        }

        
        try {
            if (prestamo?.clientId) {
                // Si estoy editando...
                await updateLoan({
                    ...loan,
                    _id: prestamo._id,
                    finishDate: calculateEndDate(loan.date, installments)
                });
                toast.success('Prestamo Actualizado correctamente');
            } else {
                // Si estoy creando...
                await addLoan({
                    ...loan,
                    finishDate: calculateEndDate(loan.date, installments)
                });
                toast.success('Prestamo Añadido Correctamente!');
            }
        } catch (error) {
            console.log(error);
            toast.error('Hubo un error');
        }

        // Clean Fields
        setLoan({
            loanAmount: '',
            interest: '',
            installments: '',
            date: Date.now(),
            clientId: ''
        });
        
        // Close Modal
        setShowLoan(false);
        
    }

    const selectClient = e => {
        e.preventDefault();

        if (document === '') {
            setMessage('Ingresa un número de cedula')
            showAlert(true);
            setTimeout(() => {
                showAlert(false);
            }, 2000);
            return;
        }
        const client = clients.filter(client => client.document === document);

        if (client.length === 0) {
            setMessage('Cédula incorrecta')
            showAlert(true);
            setTimeout(() => {
                showAlert(false);
            }, 2000);
            return;
        }

        setLoan({
            ...loan,
            clientId: client[0]._id
        });
        setClient(client[0]);
        setShowForm(true);
    }

  return (
    <Transition appear show={showLoan} as={Fragment}>
        <Dialog
          open={showLoan}
          transition
          className='fixed inset-0 flex w-screen items-center justify-center p-4 z-200'
              onClose={() => {
                setSelectedClient(null);
                setShowLoan(false);
                if (setPrestamo) {
                    setPrestamo({})
                };
              }}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-70" />
          </TransitionChild>
            {/* Modal content */}
            <DialogPanel className="relative z-10 bg-white rounded-lg shadow dark:bg-gray-700">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {prestamo?.clientId ? 'Editar Prestamo': 'Añadir prestamo'}
                  </DialogTitle>
                  <button
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() => {
                        setSelectedClient(null);
                        setPrestamo({});
                        setShowLoan(false);
                    }}>
                      <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                      </svg>
                      <span className="sr-only">Close modal</span>
                  </button>
              </div>
              {/* Modal Body */}
             {showForm ?  
              <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                <p className='text-lg text-center uppercase font-light mb-5 text-black dark:text-white'>{client.name || ''}</p>
                { alert ? (
                    <div className='p-2 bg-red-200 text-center mb-2'>
                        <p className='text-red-600 font-black'>{message}</p>
                    </div>
                ) : '' }
                <div className="grid gap-4 mb-4 grid-cols-2">
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="installments" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descripción</label>
                        <input type='text' id="description" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" name="description" placeholder='Nombre del Prestamo' value={loan?.description} onChange={handleChange} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="installments" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cantidad de Cuotas</label>
                        <input type='number' id="installments" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" name="installments" placeholder='cuotas diarias' value={loan?.installments} onChange={handleChange} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="loanAmount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cantidad</label>
                        <input type="number" name="loanAmount" id="loanAmount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Valor Prestado" required="" value={loan?.loanAmount} onChange={handleChange} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="interest" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Interés</label>
                        <input type="number" name="interest" id="interest" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Ej: 20%" required="" value={loan?.interest} onChange={handleChange} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fecha</label>
                        <input type="date" name="date" id="date" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" required="" value={loan?.date} onChange={handleChange} />
                    </div>
                </div>
                <button
                type="submit"
                className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                    {prestamo?.clientId ? 'Guardar Cambios' : 'Guardar Prestamo'}
                </button>
              </form> : (
                <div className='p-3'>
                    <form>
                        <h4 className='text-black dark:text-white p-4 font-bold text-lg'>Ingresa número de cedula</h4>
                        { alert ? (
                            <div className='p-2 bg-red-200 text-center mb-2'>
                                <p className='text-red-600 font-black'>{message}</p>
                            </div>
                        ) : '' }
                        <input
                            type='text'
                            value={document}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
                            placeholder='Ingresa cedula aquí'
                            onChange={e => setDocument(e.target.value)}
                        />
                        
                        <buton
                            type="button"
                            className='block mt-2 text-center bg-cyan-600 text-white py-2 w-full font-bold cursor-pointer'
                            onClick={selectClient}
                        >SELECCIONAR</buton>
                    </form>
                </div>
              )}
            </DialogPanel>
        </Dialog>
    </Transition>
  )
}

export default ModalLoan