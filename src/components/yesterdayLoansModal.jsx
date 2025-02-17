"use client";

import { Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react'
import { formatearFecha, formatearNumero } from '@component/helpers'

const YesterdayLoansModal = ({ showModal, setShowModal, prestamos }) => {
  const handleClose = () => {
    setShowModal(false);
  }

  return (
    <Transition appear show={showModal} as={Fragment}>
      <Dialog
        open={showModal}
        onClose={handleClose}
        className="fixed inset-0 z-50 flex items-center justify-center w-screen p-4"
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-70" />
        </Transition.Child>

        <DialogPanel className="relative z-10 bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 border-b rounded-t md:p-5 dark:border-gray-600">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Préstamos Ayer
            </DialogTitle>
            <button
              type="button"
              className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={handleClose}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <ul className="p-4 overflow-y-auto max-h-80">
            {prestamos && prestamos.length > 0 ? (
              prestamos.map((loan, index) => (
                <li key={index}>
                  <ul className="flex items-center justify-between gap-4 p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                    <li className="table-cell py-2">
                      <p className="inline-flex items-center font-bold text-emerald-500">
                        ${formatearNumero(loan.loanAmount)}
                      </p>
                      <p className="text-xs font-medium text-gray-500">Monto del Préstamo</p>
                    </li>
                    <li className="md:table-cell">
                      <p className="text-sm font-medium text-gray-800">{loan.clientId?.name}</p>
                      <p className="text-xs font-medium text-gray-500">Cliente</p>
                    </li>
                    <li className="hidden md:table-cell">
                      <p className="text-sm font-medium text-gray-800">{formatearFecha(loan.date)}</p>
                      <p className="text-xs font-medium text-gray-500">Fecha</p>
                    </li>
                  </ul>
                </li>
              ))
            ) : (
              <li className="p-2 text-sm font-medium text-gray-500">No hay préstamos registrados ayer.</li>
            )}
          </ul>
        </DialogPanel>
      </Dialog>
    </Transition>
  )
}

export default YesterdayLoansModal;
