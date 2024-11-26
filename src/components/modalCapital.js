import { Fragment, useState, useContext } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { PaymentsContext } from '../contexts/PaymentsContext';
import { toast } from 'react-toastify';

const ModalCapital = ({ showModal, setShowModal }) => {

    const { postCapital, getCapital } = useContext(PaymentsContext); 

    const [alert, showAlert] = useState(false);
    
    const [message, setMessage] = useState('');

    const [capital, setCapital] = useState({
        source: '',
        capital: '',
    });
    const handleChange = e =>  {
        setCapital({ ...capital, [e.target.name] : e.target.value })
    }
    
    const handleSubmit = async e => {
        e.preventDefault();

        // Validation
        if (capital.source.trim() === '') {
            setMessage('Añade la fuente del capital (inversionista, fondo)');
            showAlert(true);
            setTimeout(() => {
                showAlert(false);
            }, 3000);
            return;
        }
        if (capital.capital.trim() === '') {
            setMessage('Añade el monto del capital');
            showAlert(true);
            setTimeout(() => {
                showAlert(false);
            }, 3000);
            return;
        }

        // Añadir al capital
        await postCapital(capital);
        
        // Actualizar capital
        getCapital();
        
        // Formatear
        setCapital({
            source: '',
            capital: '',
        })
        // Ocultar modal
        setShowModal(false);

        // Mostrar alerta
        toast.success('Capital Añadido correctamente');
    }

    return (
        <>
        <Transition appear show={showModal} as={Fragment}>
        <Dialog
          open={showModal}
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
                        Añadir Capital
                    </DialogTitle>
                    <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setShowModal(false)}>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>

                {/* Modal Body */}
                <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                    { alert ? (
                        <div className='p-2 bg-red-200 text-center mb-2'>
                            <p className='text-red-600 font-black'>{message}</p>
                        </div>
                    ) : '' }
                  <div className="grid gap-4 mb-4 grid-cols-2">
                    <div className="col-span-2">
                        <label htmlFor="source" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fuente</label>
                        <input type="text" name="source" id="source" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Fuente Del Capital" required="" value={capital.source} onChange={handleChange} />
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="capital" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cantidad</label>
                      <input type="number" name="capital" id="capital" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Monto Del Capital" required="" value={capital.capital} onChange={handleChange} />
                    </div>

                    <button
                      type="submit"
                      className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                      Añadir Capital 
                    </button>
                  </div>
                </form>
            </DialogPanel>
        </Dialog>
      </Transition>
    </>
  )
}

export default ModalCapital