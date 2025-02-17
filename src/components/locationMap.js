import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { GoogleMap, Marker } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '400px'
}

export default function LocationMap({
  openLocation,
  setOpenLocation,
  initialLocation,
  onSave
}) {
  function onMarkerDragEnd(event) {
    const newLat = event.latLng.lat()
    const newLng = event.latLng.lng()
    onSave({ lat: newLat, lng: newLng })
  }

  function handleClose() {
    setOpenLocation(false)
  }

  return (
    <Transition appear show={openLocation} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        open={openLocation}
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

        <div className="relative w-full max-w-[90vw]">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-90"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-0 scale-100"
            leaveTo="opacity-0 scale-90"
          >
            <Dialog.Panel className="relative z-[9999] bg-white rounded-lg shadow dark:bg-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
                <Dialog.Title as="h2" className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ruta Del Cliente
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

              {/* Cuerpo con el mapa */}
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={initialLocation}
                zoom={14}
              >
                <Marker
                  position={initialLocation}
                  draggable
                  onDragEnd={onMarkerDragEnd}
                />
              </GoogleMap>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
