"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Button from "@component/components/Button";
import { formatearNumero, formatearFecha } from "@component/helpers";
import { useContext } from "react";
import { PaymentsContext } from "@component/contexts/PaymentsContext";
import Swal from "sweetalert2";

export default function ModalPaymentInfo({ payment, onClose }) {
  const { deletePayment } = useContext(PaymentsContext);

  function handleDelete() {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Esto eliminará el pago permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#999",
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deletePayment(payment._id);
        onClose();
      }
    });
  }

  return (
    <Transition appear show={!!payment} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="
                  w-full max-w-md transform 
                  overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left 
                  align-middle shadow-xl transition-all
                "
              >
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-black dark:text-white mb-4"
                >
                  Datos del Pago
                </Dialog.Title>

                {/* Contenido */}
                <div className="text-black dark:text-white space-y-3">
                  <p>
                    <span className="inline-block w-28 font-semibold">
                      Cliente:
                    </span>
                    {payment.clientId?.name}
                  </p>
                  <p>
                    <span className="inline-block w-28 font-semibold">
                      Cédula:
                    </span>
                    {payment.clientId?.document}
                  </p>
                  <p>
                    <span className="inline-block w-28 font-semibold">
                      Teléfono:
                    </span>
                    {payment.clientId?.contact}
                  </p>
                  <p>
                    <span className="inline-block w-28 font-semibold">
                      Cantidad:
                    </span>
                    ${formatearNumero(payment.amount)}
                  </p>
                  <p>
                    <span className="inline-block w-28 font-semibold">
                      Fecha:
                    </span>
                    {formatearFecha(payment.date)}
                  </p>
                  <p>
                    <span className="inline-block w-28 font-semibold">
                      Saldo:
                    </span>
                    {formatearNumero(
                      payment?.saldoAlMomento ?? 0
                    )}
                  </p>
                  <p>
                    <span className="inline-block w-28 font-semibold">
                      Mora:
                    </span>
                    {formatearNumero(payment.mora || 0)}
                  </p>
                  {/* Etc. si quieres más detalles del Loan */}
                </div>

                {/* Botones */}
                <div className="mt-6 flex items-center justify-end gap-2">
                  <Button variant="secondary" onClick={onClose}>
                    Cerrar
                  </Button>
                  <Button variant="primary" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
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
