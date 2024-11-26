import { Dialog } from '@headlessui/react';
import { GoogleMap, DirectionsService, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { Fragment, useEffect, useState } from 'react';
import { Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react';

const center = {
  lat: 0, // Default latitude
  lng: 0, // Default longitude
};

const libraries = ['places'];

const containerStyle = {
  width: '400px',
  height: '400px',
};

const MapRoute = ({ showMap, setShowMap, destinationCoords }) => {
    
  // Define el array `libraries` fuera del componente para evitar recargas innecesarias

  const [directions, setDirections] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error fetching location', error);
        }
      );
    }
  }, []);

  useEffect(() => {
      console.log('currentLocation', currentLocation);
      console.log('Destination', destinationCoords);
    if (currentLocation && destinationCoords) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: currentLocation,
          destination: destinationCoords,
          travelMode: window.google.maps.TravelMode.DRIVING, // Opciones: DRIVING, WALKING, BICYCLING, TRANSIT
          },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error('Error fetching directions', result);
          }
        }
      );
    }
  }, [currentLocation, destinationCoords]);
    return (
        <Transition appear show={showMap} as={Fragment}>
            <Dialog
                open={showMap}
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
                    <div
                        className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600"
                    >
                        <DialogTitle
                            className="text-lg font-semibold text-gray-900 dark:text-white"
                        >
                            Ruta Del Cliente
                        </DialogTitle>
                        <button
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={() => setShowMap(false)}
                        >
                            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    {/* Modal Body */}
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={currentLocation || center}
                        zoom={14}>
                    {directions && <DirectionsRenderer directions={directions} />}
                    </GoogleMap>
                </DialogPanel>
            </Dialog>
        </Transition>
    )
};


export default MapRoute