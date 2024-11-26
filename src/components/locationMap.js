import { GoogleMap, Marker } from '@react-google-maps/api';
import { Transition, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useState, useEffect, Fragment } from 'react';

// Define el estilo del contenedor del mapa
const containerStyle = {
  width: '90vw',
  height: '400px',
};


const locationMap = ({ openLocation, setOpenLocation, initialLocation, onSave }) => {

  // Función para mover el marcador
  const onMarkerDragEnd = (event) => {
    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();
    onSave({ lat: newLat, lng: newLng });
  };

  // Guardar la nueva ubicación
  const handleSave = () => {
    onSave(markerPosition);
    onClose();  // Cerrar modal después de guardar
  };
  
  return (
    <Transition appear show={openLocation} as={Fragment}>
        <Dialog
            open={openLocation}
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
                        onClick={() => setOpenLocation(false)}
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
                    center={initialLocation}
                    zoom={14}
                >
                    {/* Marcador draggable */}
                    <Marker
                        position={initialLocation}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}  // Actualizar la posición cuando el marcador se mueva
                    />
                </GoogleMap>
            </DialogPanel>
        </Dialog>
    </Transition>
    )
}

export default locationMap