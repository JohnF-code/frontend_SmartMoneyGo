import { Fragment, useState, useContext } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { formatearFecha } from '../helpers';
import LoanItem from './LoanItem';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MapRoute from './MapRoute';


const ModalInfo = ({ showInfo, setShowInfo, loan, client }) => {

  const [showMap, setShowMap] = useState(false);
  const [destinationCoords, setDestinationCoords] = useState({});
  // Context State
  const showClientLocation = async () => {
    console.log(client.coordinates);
    
    setDestinationCoords({
      lat: client.coordinates[0],
      lng: client.coordinates[1]
    });
    setShowMap(true);
  }

  return (
    <>
      <Transition appear show={showInfo} as={Fragment}>
        <Dialog
          open={showInfo}
          transition
          className='fixed inset-0 flex w-screen items-center justify-center p-4 z-200'
          onClose={() => setShowInfo(false)}
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
                      Detalles del Cliente
                  </DialogTitle>
                  <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setShowInfo(false)}>
                      <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                      </svg>
                      <span className="sr-only">Close modal</span>
                  </button>
              </div>

              {/* Modal Body */}
              <div className='p-4 md:p-5'>
                <div className='grid gap-5 mb-4 grid-cols-2'>
                    <div>
                        <p className='text-sm md:text-xl font-light'>
                          Nombre:
                          <span className='font-bold'> {client.name}</span>
                        </p>
                    </div>
                    <div>
                        <p className='text-sm md:text-xl font-light'>
                          Contacto:
                          <span className='font-bold'> {client.contact}</span>
                        </p>
                    </div>
                    <div>
                        <p className='text-sm md:text-xl font-light'>
                          Cedula:
                          <span className='font-bold'> {client.document}</span>
                        </p>
                    </div>
                    <div>
                        <p className='text-sm md:text-xl font-light'>
                          Fecha:
                          <span className='font-bold'> {formatearFecha(client.date)}</span>
                        </p>
                    </div>
                    <div className='col-span-2'>
                      <button
                        type='button'
                        className='text-white bg-blue-500 py-2 px-5 rounded-full'
                        onClick={showClientLocation}
                      >Ver Ruta <FontAwesomeIcon icon={faLocationDot} className='text-white'/></button>
                    </div>
                    <div className='col-span-2 shadow-lg rounded overflow-y-auto'>  
                      <ul className="bg-white">
                        {loan ? 
                          loan.map((loan, index) => (
                            <LoanItem
                              key={index}
                              loan={loan}
                              index={index}
                            />
                          ))
                        : ''}
                      </ul>
                    </div>
                </div>
              </div>
            </DialogPanel>
        </Dialog>
      </Transition>
      {showMap ? (
        <MapRoute
          destinationCoords={destinationCoords}
          showMap={showMap}
          setShowMap={setShowMap}
        />
      ): ''}
    </>
  )
}

export default ModalInfo