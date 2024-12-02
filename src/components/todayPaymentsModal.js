import { Fragment, useState, useContext } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { formatearFecha, formatearNumero } from '@component/helpers'

const TodayPaymentsModal = ({ showModal, setShowModal, prestamos }) => {

    const handleClose = () => {
        setShowModal(false);
    }

  return (
    <Transition appear show={showModal} as={Fragment}>
        <Dialog
          open={showModal}
          transition
          className='fixed inset-0 flex w-screen items-center justify-center p-4 z-200'
          onClose={() => setShowModal(false)}
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
                    Pagos Pendientes Hoy
                  </DialogTitle>
                  <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={handleClose}>
                      <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                      </svg>
                      <span className="sr-only">Close modal</span>
                  </button>
              </div>

              {/* Modal Body */}
              <ul className='p-4 max-h-80 overflow-y-auto'>
                  {prestamos.map((loan, index) => (
                      <li
                        key={index}
                      >
                        <ul
                            className="flex items-center justify-between accordion border-b border-grey-light hover:bg-gray-100 cursor-pointer gap-4 p-2"
                        >
                            <li className="table-cell py-2">
                                <p className='inline-flex items-center font-bold text-emerald-500'>${formatearNumero(loan?.amount)}</p>
                                <p className="text-xs text-gray-500 font-medium">Cuota</p>
                            </li>
                            <li className="md:table-cell">
                                <p className="text-sm text-gray-800 font-medium">{loan.clientId?.name}</p>
                                <p className="text-xs text-gray-500 font-medium">Nombre</p>
                            </li>
                            <li className="hidden md:table-cell">
                                <p className="text-sm text-gray-800 font-medium">{formatearFecha(loan?.date)}</p>
                                <p className="text-xs text-gray-500 font-medium">Fecha</p>
                            </li>
                        </ul>
                    </li>
                ))}
              </ul>
            </DialogPanel>
        </Dialog>
    </Transition>
  )
}

export default TodayPaymentsModal