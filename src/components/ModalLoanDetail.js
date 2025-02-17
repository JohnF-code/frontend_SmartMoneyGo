"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import Button from "@component/components/Button";
 // Asegúrate de la ruta correcta
 import { formatearFecha, formatearNumero } from "@component/helpers";


function ModalLoanDetail({ loan, onClose }) {
  if (!loan) return null;
  return createPortal(
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-700 rounded p-6 max-w-lg w-full relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-primary font-bold" onClick={onClose}>
              <FontAwesomeIcon icon={faX} size="lg" /> Cerrar
            </button>
            <Dialog.Title className="text-2xl font-bold text-center mb-4 text-black dark:text-white">
              Detalle del Préstamo
            </Dialog.Title>
            <div className="space-y-2 text-black dark:text-white">
              <p>
                <span className="font-semibold">Cliente:</span>{" "}
                {loan.clientId?.name ? loan.clientId.name : "Sin nombre"}
              </p>
              <p>
                <span className="font-semibold">Descripción:</span>{" "}
                {loan.description || "Sin descripción"}
              </p>
              <p>
                <span className="font-semibold">Cédula:</span>{" "}
                {loan.clientId?.document || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Contacto:</span>{" "}
                {loan.clientId?.contact || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Préstamo Inicial:</span>{" "}
                {formatearNumero(loan.loanAmount)}
              </p>
              <p>
                <span className="font-semibold">Saldo Actual:</span>{" "}
                {formatearNumero(loan.balance)}
              </p>
              <p>
                <span className="font-semibold">Cuota/Diaria:</span>{" "}
                {formatearNumero(loan.installmentValue)}
              </p>
              <p>
                <span className="font-semibold">Cuotas Totales:</span>{" "}
                {loan.installments}
              </p>
              <p>
                <span className="font-semibold">Fecha de Inicio:</span>{" "}
                {formatearFecha(loan.date)}
              </p>
              <p>
                <span className="font-semibold">Fecha Finalización:</span>{" "}
                {formatearFecha(loan.finishDate)}
              </p>
              {loan.latestPayment ? (
                <>
                  <p>
                    <span className="font-semibold">Última Cuota:</span>{" "}
                    {formatearFecha(loan.latestPayment.date)}
                  </p>
                  <p>
                    <span className="font-semibold">Valor Último Pago:</span>{" "}
                    {formatearNumero(loan.latestPayment.amount)}
                  </p>
                </>
              ) : (
                <p className="font-bold text-red-600">Sin pagos registrados.</p>
              )}
            </div>
            <div className="mt-4 flex gap-2 justify-center">
              <Button variant="primary" onClick={() => { /* Acción: Registrar Pago */ }}>
                Registrar Pago
              </Button>
              <Button variant="secondary" onClick={() => { /* Acción: Editar Préstamo */ }}>
                Editar Préstamo
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>,
    document.body
  );
}

export default ModalLoanDetail;
