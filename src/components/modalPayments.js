import { Fragment, useState, useContext } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { ClientsContext } from '../contexts/ClientsContext';
import { LoansContext } from '@component/contexts/LoansContext';
import { AuthContext } from '@component/contexts/AuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { formatearNumero } from '@component/helpers';

const ModalPayments = ({ showPayment, setShowPayment}) => {

  const clientsContext = useContext(ClientsContext);
  const { addPayment, currentClient } = clientsContext;

  const loansContext = useContext(LoansContext);
  const { getLoans } = loansContext;

  const authContext = useContext(AuthContext)
  const { user } = authContext;


  // State
  const [payment, setPayment] = useState({
    clientId: currentClient._id,
    loanId: currentClient.loanId,
    document: currentClient.document,
    amount: parseInt(currentClient.installmentValue),
    date: Date.now()
  });

  const { document, amount, date } = payment;

  const amountc = Array.isArray(amount)
  ? amount.reduce((total, current) => total + current.amount, 0) 
  : amount; 

  const saldoc = () => {
    return Array.isArray(currentClient.balance)
      ? currentClient.balance.reduce((total, current) => total + current.balance, 0)
      : currentClient.balance; 
  };

  // Change Inputs
  const handleChange = e => {
    setPayment({ ...payment, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setShowPayment(false); // Cerrar el modal principal
    const request = await addPayment({
      ...payment,
      balance: currentClient.balance,
      clientId: currentClient._id,
    });

    setPayment({
      document: '',
      amount: '',
      Date: '',
    });

    await getLoans();

  }
  

  const handleConfirm = () => {
    Swal.fire({
      title: '¿Confirmar registro de pago?',
      html: `Se registrará un pago por <span class="text-green-500 font-bold">${formatearNumero(amountc)}</span>. El saldo pendiente es <span class="text-red-500 font-bold">${formatearNumero(saldoc())}</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      scrollbarPadding: false,
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false, // Bloquea interacciones fuera del modal
      preConfirm: async () => {
        Swal.showLoading(); // Bloquea el botón con un loader
        Swal.getCancelButton().style.display = 'none'; // Desactiva el botón de cancelar
        try {
          await handleSubmit(); // Ejecuta la lógica del registro
          Swal.fire({
            title: 'Pago Registrado',
            text: 'El pago fue registrado con éxito.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          })
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al registrar el pago.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      },
    });
  };

  return (
    <>
      <Transition appear show={showPayment} as={Fragment}>
        <Dialog
          open={showPayment}
          transition
          className='fixed inset-0 flex w-screen items-center justify-center p-4 z-200'
          onClose={() => setShowPayment(false)}
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
                Registrar Pago
              </DialogTitle>
              <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setShowPayment(false)}>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            {/* Modal Body */}
            <form className="p-4 md:p-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 mb-4 grid-cols-2">
                <div className="col-span-2">
                  <label htmlFor="document" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cedula</label>
                  <input type="text" name="document" id="document" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="número de cedula" required="" value={document} disabled onChange={handleChange} />
                </div>

                <div className="col-span-2">
                  <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cantidad</label>
                  <input type="text" name="amount" id="amount" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Número de teléfono" required="" value={amount} onChange={handleChange} />
                </div>

                {user.role === 'administrador' ? (
                  <div className="col-span-2">
                    <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fecha</label>
                    <input type="date" name="date" id="date" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Fecha De Pago" value={date} onChange={handleChange} />
                  </div>
                ) : ''}

                <button
                  type="button"
                  className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  onClick={handleConfirm}
                >
                  <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                  Registrar Pago
                </button>
              </div>
            </form>
          </DialogPanel>
        </Dialog>
      </Transition>
    </>
  )
}

export default ModalPayments