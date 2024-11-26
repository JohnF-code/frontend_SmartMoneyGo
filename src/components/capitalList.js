import { Fragment, useState, useContext } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { formatearFecha } from '@component/helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { BillsContext } from '@component/contexts/BillsContext';
import { PaymentsContext } from '@component/contexts/PaymentsContext';
import { WithdrawalContext } from '@component/contexts/WithdrawalContext';

const CapitalList = ({ showModal, setShowModal, capital, bills, withdrawals }) => {

    const { deleteBill } = useContext(BillsContext);
    const { deleteCapital } = useContext(PaymentsContext);
    const { deleteWithdrawal } = useContext(WithdrawalContext);

    const titleModal = () => {
        if (capital) {
            return 'Abonos de capital'
        } else if (bills) {
            return 'Lista de Gastos'
        } else if (withdrawals) {
            return 'Lista de Retiros'
        }
    }

    const onClickBill = id => {
        deleteBill(id);
    }

    const onClickCapital = id => {
        deleteCapital(id);
    }

    const onClickWithdraw = id => {
        deleteWithdrawal(id);
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
                        {titleModal()}
                    </DialogTitle>
                    <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setShowModal(false)}>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>

                {/* Modal Body */}
                <div className='p-2 md:p-5'>
                    <div className='flex flex-col items-start justify-start w-full mb-4 max-h-72 overflow-y-auto p-2'>
                       {capital ? 
                            capital.map((item, index) => (
                                <ul
                                    key={index}
                                    className='flex gap-4 items-start justify-between w-full py-2 border-slate-200 border-b-2'
                                >
                                    <li>{formatearFecha(item.date)}</li>
                                    <li>{item.source}</li>
                                    <li className='text-emerald-500 font-bold'>${item.capital}</li>
                                    <li>
                                        <FontAwesomeIcon
                                            icon={faX}
                                            className='text-gray-400 cursor-pointer'
                                            onClick={() => onClickCapital(item._id)}
                                        />
                                    </li>
                                </ul>   
                            )) 
                        : ''}
                        {bills ? 
                            bills.map((item, index) => (
                                <ul
                                    key={index}
                                    className='flex gap-4 items-start justify-between w-full py-2 border-slate-200 border-b-2'
                                >
                                    <li>{formatearFecha(item.date)}</li>
                                    <li>
                                        <p>{item.description}</p>
                                    </li>
                                    <li className='text-emerald-500 font-bold'>${item.amount}</li>
                                    <li>
                                        <FontAwesomeIcon
                                            icon={faX}
                                            className='text-gray-400 cursor-pointer'
                                            onClick={() => onClickBill(item._id)}
                                        />
                                    </li>
                                </ul>   
                            ))
                              : ''}
                          {withdrawals ? 
                            withdrawals.map((item, index) => (
                                <ul
                                    key={index}
                                    className='flex gap-4 items-start justify-between w-full py-2 border-slate-200 border-b-2'
                                >
                                    <li>{formatearFecha(item.date)}</li>
                                    <li>
                                        <p>{item.name}</p>
                                    </li>
                                    <li className='text-emerald-500 font-bold'>${item.amount}</li>
                                    <li>
                                        <FontAwesomeIcon
                                            icon={faX}
                                            className='text-gray-400 cursor-pointer'
                                            onClick={() => onClickWithdraw(item._id)}
                                        />
                                    </li>
                                </ul>   
                            ))
                        : ''}
                    </div>
                </div>
            </DialogPanel>
        </Dialog>
    </Transition>
  )
}

export default CapitalList;