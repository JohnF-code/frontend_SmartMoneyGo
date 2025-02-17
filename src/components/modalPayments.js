import { Fragment, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { ClientsContext } from '../contexts/ClientsContext';
import { LoansContext } from '@component/contexts/LoansContext';
import { AuthContext } from '@component/contexts/AuthContext';
import { formatearNumero } from '@component/helpers';

// Función throttle para limitar la frecuencia de ejecución de una función
const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  }
};

// Función para generar una clave idempotente única
const generateIdempotencyKey = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

const ModalPayments = ({ showPayment, setShowPayment }) => {

  const { addPayment, currentClient } = useContext(ClientsContext);
  const { getLoans } = useContext(LoansContext);
  const { user } = useContext(AuthContext);

  // Estado inicial del pago
  const [payment, setPayment] = useState({
    clientId: currentClient._id,
    loanId: currentClient.loanId,
    document: currentClient.document,
    amount: parseInt(currentClient.installmentValue),
    date: Date.now()
  });

  // Estado para la clave idempotente
  const [idempotencyKey, setIdempotencyKey] = useState(generateIdempotencyKey());

  // Estado para controlar el procesamiento y evitar envíos duplicados
  const [isProcessing, setIsProcessing] = useState(false);

  // Estado para mostrar la sección de confirmación integrada en el modal
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Al abrir el modal se reinician la clave idempotente y la sección de confirmación
  useEffect(() => {
    if (showPayment) {
      setIdempotencyKey(generateIdempotencyKey());
      setShowConfirmation(false);
    }
  }, [showPayment]);

  const { document, amount, date } = payment;

  // Calcula el monto total a pagar
  const amountc = Array.isArray(amount)
    ? amount.reduce((total, current) => total + current.amount, 0)
    : amount; 

  // Función para calcular el saldo actual
  const saldoc = () => {
    return Array.isArray(currentClient.balance)
      ? currentClient.balance.reduce((total, current) => total + current.balance, 0)
      : currentClient.balance; 
  };

  // Manejo de cambios en los inputs
  const handleChange = e => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  // Función para registrar el pago, con seguridad (idempotencia, flag, etc.)
  const handleSubmit = useCallback(async () => {
    setIsProcessing(true);
    const paymentData = {
      ...payment,
      idempotencyKey,
      balance: currentClient.balance,
      clientId: currentClient._id,
    };
    try {
      setShowPayment(false); // Cierra el modal principal
      await addPayment(paymentData);
      setPayment({
        document: '',
        amount: '',
        date: '',
      });
      await getLoans();
    } catch (error) {
      console.error("Error al registrar el pago:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [payment, idempotencyKey, currentClient, addPayment, getLoans, setShowPayment]);

  // Calcula el saldo pendiente (saldo actual menos monto de cuota)
  const saldoPendiente = Number(saldoc()) - Number(amountc);

  // Almacenamos la función throttled para la acción de confirmar, para evitar múltiples envíos en 10 segundos (10000 ms)
  const throttledConfirmActionRef = useRef(throttle(async () => {
    await handleSubmit();
    setShowConfirmation(false);
  }, 10000));

  // Handler para mostrar la sección de confirmación integrada
  const handleShowConfirmation = () => {
    if (!isProcessing) {
      setShowConfirmation(true);
    }
  };

  // Handler para cancelar la confirmación y volver al formulario
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <Transition appear show={showPayment} as={Fragment}>
      <Dialog
        open={showPayment}
        transition
        className="fixed inset-0 flex w-screen items-center justify-center p-4 z-200"
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

        <DialogPanel className="relative z-10 bg-white rounded-lg shadow dark:bg-gray-700">
          {/* Encabezado del Modal */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Registrar Pago
            </DialogTitle>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => setShowPayment(false)}
            >
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          {/* Cuerpo del Modal */}
          <form className="p-4 md:p-5" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="grid gap-4 mb-4 grid-cols-2">
              <div className="col-span-2">
                <label htmlFor="document" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cédula</label>
                <input
                  type="text"
                  name="document"
                  id="document"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Número de cédula"
                  required
                  value={document}
                  disabled
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cantidad</label>
                <input
                  type="text"
                  name="amount"
                  id="amount"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Cantidad a pagar"
                  required
                  value={amount}
                  onChange={handleChange}
                />
              </div>

              {user.role === 'administrador' && (
                <div className="col-span-2">
                  <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fecha</label>
                  <input
                    type="date"
                    name="date"
                    id="date"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Fecha de pago"
                    value={date}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            {/* Información dinámica del saldo, en letra grande (26px) */}
            <div className="mb-4 text-center">
              <p style={{ fontSize: '26px', fontWeight: 'bold' }}>
                Saldo Pendiente: {formatearNumero(saldoPendiente)}
              </p>
            </div>

            {/* Sección de confirmación integrada en el modal */}
            {showConfirmation ? (
              <div className="border p-4 rounded mb-4 text-center">
                <p style={{ fontSize: '26px', fontWeight: 'bold' }}>
                  Saldo Pendiente: {formatearNumero(saldoPendiente)}
                </p>
                <p className="mb-4">Se registrará un pago por: {formatearNumero(amountc)}</p>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => throttledConfirmActionRef.current()}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleCancelConfirmation}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : null}

            {/* Botón para mostrar la sección de confirmación */}
            {!showConfirmation && (
              <div className="flex justify-center">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleShowConfirmation}
                  className={`text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Registrar Pago
                </button>
              </div>
            )}
          </form>
        </DialogPanel>
      </Dialog>
    </Transition>
  );
};

export default ModalPayments;
