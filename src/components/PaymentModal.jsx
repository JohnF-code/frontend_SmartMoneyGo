"use client";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Button from "@component/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faXmark } from "@fortawesome/free-solid-svg-icons";
import { formatearFecha, formatearNumero } from "../helpers";

// EJEMPLO: modal con columns
export default function PaymentModal({ payment, onClose, onDelete }) {
  // Para el “espacio de 10 caracteres” => usaremos `ml-10` y `mb-2`, etc.
  // Para carrusel horizontal => mostrarlos en un contenedor con “overflow-x-auto”
  // e “inline-block min-w-[600px]” por ejemplo.

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-90"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-90"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment}>
              <Dialog.Panel
                className="
                  w-full max-w-xl transform overflow-hidden 
                  rounded-xl bg-white dark:bg-gray-800 p-6 
                  text-left align-middle shadow-xl transition-all
                "
              >
                {/* Header modal */}
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-extrabold leading-6 text-gray-900 dark:text-white"
                  >
                    Datos Préstamo
                  </Dialog.Title>
                  <button
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={onClose}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>

                {/* Contenido con carrusel horizontal en móvil */}
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-[600px]">
                    {/* Espacio de 10 caracteres => usaremos un padding-left */}
                    <div className="pl-10 text-black dark:text-white">
                      {/* Ejemplo de fields */}
                      <p className="mb-2">
                        <span className="inline-block w-[9ch] font-bold">Nombre:</span>
                        {payment.clientId?.name}
                      </p>
                      <p className="mb-2">
                        <span className="inline-block w-[9ch] font-bold">Cédula:</span>
                        {payment.clientId?.document}
                      </p>
                      <p className="mb-2">
                        <span className="inline-block w-[9ch] font-bold">Teléf.:</span>
                        {payment.clientId?.contact}
                      </p>
                      <p className="mb-2">
                        <span className="inline-block w-[9ch] font-bold">Préstamo:</span>
                        {formatearNumero(payment.loanId?.loanAmount)}
                      </p>
                      <p className="mb-2">
                        <span className="inline-block w-[9ch] font-bold">Interés:</span>
                        {payment.loanId?.interest}%
                      </p>
                      <p className="mb-2">
                        <span className="inline-block w-[9ch] font-bold">FechaIn:</span>
                        {formatearFecha(payment.loanId?.date)}
                      </p>
                      <p className="mb-2">
                        <span className="inline-block w-[9ch] font-bold">FechaFin:</span>
                        {formatearFecha(payment.loanId?.finishDate)}
                      </p>

                      {/* Mora, Saldo, Cuota, Progreso => si deseas */}
                      <p className="mb-2">
                        <span className="inline-block w-[9ch] font-bold">Mora:</span>
                        {/* TODO: tu lógica de mora */}
                      </p>
                      <p className="mb-2">
                        <span className="inline-block w-[9ch] font-bold">Saldo:</span>
                        {/* TODO: tu saldo */}
                      </p>
                      <p className="mb-2">
                        <span className="inline-block w-[9ch] font-bold">Cuota:</span>
                        {/* payment.cuotaNumber */}
                      </p>
                      <p className="mb-2">
                        <span className="inline-block w-[9ch] font-bold">Progreso:</span>
                        {/* Podrías poner la barra de progreso aquí también */}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botón Eliminar con <Button> + icono */}
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="primary" onClick={onClose}>
                    Cerrar
                  </Button>
                  <Button
                    variant="primary"
                    className="bg-danger hover:bg-red-600 text-white"
                    onClick={onDelete}
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="mr-2" />
                    Eliminar
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
