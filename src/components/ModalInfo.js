import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { formatearFecha } from '../helpers'
import LoanItem from './LoanItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import MapRoute from './MapRoute'

export default function ModalInfo({ showInfo, setShowInfo, loan, client }) {
  const [showMap, setShowMap] = useState(false)
  const [destinationCoords, setDestinationCoords] = useState({})

  function showClientLocation() {
    if (!client.coordinates) return
    setDestinationCoords({
      lat: client.coordinates[0],
      lng: client.coordinates[1]
    })
    setShowMap(true)
  }

  function handleClose() {
    setShowInfo(false)
  }

  return (
    <>
      <Transition appear show={showInfo} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          open={showInfo}
          onClose={handleClose}
        >
          {/* Overlay */}
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

          <div className="relative w-full max-w-xl">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-90"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-90"
            >
              <Dialog.Panel className="relative z-[9999] bg-white rounded-lg shadow dark:bg-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
                  <Dialog.Title as="h2" className="text-lg font-semibold text-gray-900 dark:text-white">
                    Detalles del Cliente
                  </Dialog.Title>
                  <button
                    type="button"
                    className="
                      w-8 h-8 text-gray-400 bg-transparent rounded-lg
                      hover:bg-gray-200 hover:text-gray-900
                      dark:hover:bg-gray-600 dark:hover:text-white
                      flex items-center justify-center
                    "
                    onClick={handleClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    &times;
                  </button>
                </div>

                {/* Cuerpo */}
                <div className="p-4 md:p-5">
                  <div className="grid grid-cols-2 gap-5 mb-4">
                    <div>
                      <p className="text-sm md:text-xl font-light text-black dark:text-white">
                        Nombre: <span className="font-bold">{client.name}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm md:text-xl font-light text-black dark:text-white">
                        Contacto: <span className="font-bold">{client.contact}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm md:text-xl font-light text-black dark:text-white">
                        Cédula: <span className="font-bold">{client.document}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm md:text-xl font-light text-black dark:text-white">
                        Fecha: <span className="font-bold">{formatearFecha(client.date)}</span>
                      </p>
                    </div>
                    <div className="col-span-2">
                      {/* Botón "Ver Ruta" -> color verde, unificado border radius */}
                      <button
                        type="button"
                        className="
                          bg-[#2BD6B1]
                          text-white
                          hover:bg-[#ACF2E3]
                          hover:text-black
                          rounded-lg
                          py-2 px-5
                          transition
                        "
                        onClick={showClientLocation}
                      >
                        Ver Ruta <FontAwesomeIcon icon={faLocationDot} className="text-white" />
                      </button>
                    </div>
                    <div className="col-span-2 shadow-lg rounded overflow-y-auto">
                      <ul className="bg-white dark:bg-gray-700">
                        {/* loan es array? */}
                        {Array.isArray(loan) &&
                          loan.map((item, idx) => (
                            <LoanItem key={idx} loan={item} index={idx} />
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Mapa */}
      {showMap && (
        <MapRoute
          showMap={showMap}
          setShowMap={setShowMap}
          destinationCoords={destinationCoords}
        />
      )}
    </>
  )
}
