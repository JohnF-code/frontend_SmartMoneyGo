import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '400px'
}
const center = { lat: 0, lng: 0 }

export default function MapRoute({ showMap, setShowMap, destinationCoords }) {
  const [directions, setDirections] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error fetching location', error)
        }
      )
    }
  }, [])

  useEffect(() => {
    if (currentLocation && destinationCoords) {
      const directionsService = new window.google.maps.DirectionsService()
      directionsService.route(
        {
          origin: currentLocation,
          destination: destinationCoords,
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result)
          } else {
            console.error('Error fetching directions', result)
          }
        }
      )
    }
  }, [currentLocation, destinationCoords])

  function handleClose() {
    setShowMap(false)
  }

  return (
    <Transition appear show={showMap} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        open={showMap}
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
            leaveFrom="opacity-100 scale-100"
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

              <GoogleMap
                mapContainerStyle={containerStyle}
                center={currentLocation || center}
                zoom={14}
              >
                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
