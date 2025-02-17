import { useContext, useState } from 'react';
import { formatearFecha, formatearNumero } from '../helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { PaymentsContext } from '@component/contexts/PaymentsContext';

const Payment = ({ payment, index }) => {
    // Contexto para manejar la función de eliminar pagos
    const { deletePayment } = useContext(PaymentsContext);

    // Estado local para mostrar/ocultar el panel de detalles
    const [panel, setPanel] = useState(false);

    return (
        <li>
            {/* Fila principal con información básica del pago */}
            <ul
                className="flex items-center justify-between px-20 border-b cursor-pointer lg:px-44 accordion border-grey-light hover:bg-gray-100 dark:hover:bg-blue-800"
                onClick={() => setPanel(!panel)}
            >
                {/* Muestra la cantidad pagada */}
                <li className="table-cell py-2">
                    <p className='inline-flex items-center font-bold text-emerald-500'>
                        ${formatearNumero(payment?.amount)}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-white">Cantidad</p>
                </li>

                {/* Muestra el nombre del cliente */}
                <li className="md:table-cell">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-400">
                        {payment.clientId?.name}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-white">Nombre</p>
                </li>

                {/* Muestra la fecha del pago */}
                <li className="md:table-cell">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-400">
                        {formatearFecha(payment?.date)}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-white">Fecha</p>
                </li>
            </ul>

            {/* Panel desplegable con detalles adicionales del préstamo */}
            <ul className={`${!panel ? 'hidden' : ''} table-row w-full`}>
                <li className='flex flex-col p-5 text-black dark:text-white'>
                    <h3 className='mb-4 text-xl font-black'>Datos Préstamo</h3>

                    {/* Información detallada */}
                    <p className='py-2 border-b-2'>Nombre: <span className='font-bold'>{payment.clientId?.name}</span></p>
                    <p className='py-2 border-b-2'>Cédula: <span className='font-bold'>{payment.clientId?.document}</span></p>
                    <p className='py-2 border-b-2'>Teléfono: <span className='font-bold'>{payment.clientId?.contact}</span></p>
                    <p className='py-2 border-b-2'>Préstamo: <span className='font-bold'>{formatearNumero(payment.loanId?.loanAmount)}</span></p>
                    <p className='py-2 border-b-2'>Intereses: <span className='font-bold'>{payment.loanId?.interest}%</span></p>
                    <p className='py-2 border-b-2'>Inicio: <span className='font-bold'>{formatearFecha(payment.clientId?.date)}</span></p>
                    <p className='py-2 border-b-2'>Fin: <span className='font-bold'>{formatearFecha(payment.loanId?.finishDate)}</span></p>

                    {/* Botón para eliminar el pago */}
                    <button
                        type='button'
                        className='text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-md  text-base px-4 py-2.5 text-center me-2 mb-2 mt-4 w-16'
                        onClick={() => deletePayment(payment._id)}
                    >
                        <FontAwesomeIcon icon={faTrashCan} />
                    </button>
                </li>
            </ul>
        </li>
    );
};

export default Payment;
