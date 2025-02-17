import { Fragment, useState, useContext, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ClientsContext } from '../contexts/ClientsContext'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import LocationMap from './locationMap'

export default function ModalClient({ showModal, setShowModal, client, cleanClient, onClose }) {
  const { clients, addClient, updateClient } = useContext(ClientsContext)

  const [data, setData] = useState({
    name: client?.name || '',
    contact: client?.contact || '',
    document: client?.document || '',
    location: client?.coordinates || ''
  })

  const [alert, showAlert] = useState(false)
  const [message, setMessage] = useState('')
  const [openLocation, setOpenLocation] = useState(false)
  const [location, setLocation] = useState({
    lat: client.coordinates ? client.coordinates[0] : 0,
    lng: client.coordinates ? client.coordinates[1] : 0
  })

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { name, document, contact } = data
    if (!name.trim() || !document.trim() || !contact.trim()) {
      setMessage('Todos los campos son obligatorios')
      showAlert(true)
      setTimeout(() => showAlert(false), 3000)
      return
    }

    if (client.name) {
      // Editar
      data.coordinates = [location.lat, location.lng]
      const res = await updateClient({ ...data, id: client._id })

      cleanClient()
      setData({ name: '', contact: '', document: '' })
      setShowModal(false)
      toast.success(res.msg)
      return
    }

    // Nuevo
    const isClient = clients.find((c) => c.document === document)
    if (isClient) {
      setMessage('Ya hay otro cliente con este número de cedula')
      showAlert(true)
      setTimeout(() => showAlert(false), 3000)
      return
    }
    await addClient({ ...data, date: new Date() }, onClose()) // Usa la fecha actual, si deseas


    setData({ name: '', contact: '', document: '' })
    setShowModal(false)
  }

  function handleClose() {
    cleanClient()
    setShowModal(false)
  }

  // Mostrar location map
  function showLocationModal() {
    setLocation({
      lat: client.coordinates?.[0] || 0,
      lng: client.coordinates?.[1] || 0
    })
    setOpenLocation(true)
  }

  function handleSaveLocation(newLocation) {
    setLocation(newLocation)
  }

  return (
    <>
      <Transition appear show={showModal} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          open={showModal}
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

          <div className="relative w-full max-w-lg">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-90"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-90"
            >
              <Dialog.Panel
                className="
                  relative
                  z-[9999]
                  bg-white
                  rounded-lg
                  shadow
                  dark:bg-gray-700
                "
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
                  <Dialog.Title as="h2" className="text-lg font-semibold text-gray-900 dark:text-white">
                    {client?.name ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="
                      w-8 h-8
                      text-gray-400
                      bg-transparent
                      rounded-lg
                      hover:bg-gray-200
                      hover:text-gray-900
                      dark:hover:bg-gray-600
                      dark:hover:text-white
                      flex
                      items-center
                      justify-center
                    "
                    onClick={handleClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    &times;
                  </button>
                </div>

                {/* Body / Form */}
                <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                  {alert && (
                    <div className="p-2 mb-2 text-center bg-red-200">
                      <p className="font-black text-red-600">{message}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                      <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        className="
                          bg-gray-50 border border-gray-300 text-gray-900
                          text-sm rounded-lg block w-full p-2.5
                          dark:bg-gray-600 dark:border-gray-500 dark:text-white
                        "
                        placeholder="Ingresar nombre completo"
                        required
                        value={data.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label
                        htmlFor="contact"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Teléfono
                      </label>
                      <input
                        type="text"
                        name="contact"
                        id="contact"
                        className="
                          bg-gray-50 border border-gray-300 text-gray-900
                          text-sm rounded-lg block w-full p-2.5
                          dark:bg-gray-600 dark:border-gray-500 dark:text-white
                        "
                        placeholder="Número de teléfono"
                        required
                        value={data.contact}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label
                        htmlFor="document"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Cédula
                      </label>
                      <input
                        type="number"
                        name="document"
                        id="document"
                        className="
                          bg-gray-50 border border-gray-300 text-gray-900
                          text-sm rounded-lg block w-full p-2.5
                          dark:bg-gray-600 dark:border-gray-500 dark:text-white
                        "
                        placeholder="Número de cédula"
                        required
                        value={data.document}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {client.name && (
                    <div className="col-span-2 mb-4">
                      <button
                        type="button"
                        className="
                          block w-full px-4 py-3 mb-5 text-sm font-bold
                          text-[#2BD6B1] uppercase transition-all bg-white
                          border-2 border-[#2BD6B1] rounded-full
                          hover:bg-[#2BD6B1] hover:text-white
                        "
                        onClick={showLocationModal}
                      >
                        Editar Ubicación <FontAwesomeIcon icon={faLocationDot} />
                      </button>
                    </div>
                  )}

                  {/* Botón "Guardar Cambios" => Texto blanco, hover => negro */}
                  <button
                    type="submit"
                    className="
                      inline-flex
                      items-center
                      bg-[#2BD6B1]
                      text-white
                      hover:bg-[#ACF2E3]
                      hover:text-black
                      transition
                      rounded-lg
                      text-sm
                      px-5
                      py-2.5
                    "
                  >
                    {client?.name ? 'Guardar Cambios' : 'Añadir Cliente'}
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Ubicación (LocationMap) se adapta al ancho */}
      {openLocation && (
        <LocationMap
          openLocation={openLocation}
          setOpenLocation={setOpenLocation}
          initialLocation={location}
          onSave={handleSaveLocation}
        />
      )}
    </>
  )
}
