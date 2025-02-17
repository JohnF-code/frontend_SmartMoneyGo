"use client"; // Indica que este archivo es un componente cliente en un entorno de renderizado híbrido (como Next.js).

import { Fragment } from 'react'; // Importa Fragment para agrupar elementos sin añadir nodos adicionales al DOM.
import { Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react'; // Importa componentes de Headless UI para construir el modal.

/**
 * Componente Modal para mostrar los clientes registrados en el día.
 * @param {boolean} showModal - Estado que determina si el modal está visible.
 * @param {function} setShowModal - Función para actualizar el estado de visibilidad del modal.
 * @param {Array} clients - Lista de clientes a mostrar en el modal.
 */
const TodayClientsModal = ({ showModal, setShowModal, clients }) => {
  /**
   * Función para cerrar el modal.
   */
  const handleClose = () => {
    setShowModal(false); // Actualiza el estado para ocultar el modal.
  }

  return (
    // Utiliza Transition para animar la aparición y desaparición del modal.
    <Transition appear show={showModal} as={Fragment}>
      {/* Componente Dialog que representa el modal en sí */}
      <Dialog
        open={showModal} // Controla si el modal está abierto o cerrado.
        onClose={handleClose} // Función que se llama al intentar cerrar el modal.
        className="fixed inset-0 z-50 flex items-center justify-center w-screen p-4" // Clases Tailwind para posicionar y estilizar el modal.
      >
        {/* Transición para el fondo oscuro del modal */}
        <Transition.Child
          as={Fragment} // No añade nodos adicionales al DOM.
          enter="ease-out duration-300" // Clase Tailwind para la animación de entrada.
          enterFrom="opacity-0" // Estado inicial de la animación de entrada.
          enterTo="opacity-100" // Estado final de la animación de entrada.
          leave="ease-in duration-200" // Clase Tailwind para la animación de salida.
          leaveFrom="opacity-100" // Estado inicial de la animación de salida.
          leaveTo="opacity-0" // Estado final de la animación de salida.
        >
          {/* Div que crea el fondo oscuro semi-transparente */}
          <div className="fixed inset-0 bg-black bg-opacity-70" />
        </Transition.Child>

        {/* Panel principal del modal */}
        <DialogPanel className="relative z-10 bg-white rounded-lg shadow dark:bg-gray-700">
          {/* Cabecera del modal con el título y el botón de cerrar */}
          <div className="flex items-center justify-between p-4 border-b rounded-t md:p-5 dark:border-gray-600">
            {/* Título del modal */}
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Clientes Hoy
            </DialogTitle>
            {/* Botón para cerrar el modal */}
            <button
              type="button"
              className="inline-flex items-center justify-center w-8 h-8 text-sm text-gray-400 bg-transparent rounded-lg hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={handleClose} // Llama a handleClose al hacer clic.
            >
              {/* Icono SVG de una "X" para representar el botón de cerrar */}
              <svg
                className="w-3 h-3"
                aria-hidden="true" // Atributo para accesibilidad.
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              {/* Texto oculto para lectores de pantalla */}
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          {/* Lista de clientes dentro del modal */}
          <ul className="p-4 overflow-y-auto max-h-80">
            {/* Condicional para verificar si hay clientes */}
            {clients && clients.length > 0 ? (
              // Mapea cada cliente y lo muestra en una lista.
              clients.map((client, index) => (
                <li key={index}>
                  <ul className="flex items-center justify-between gap-4 p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100">
                    {/* Nombre del cliente */}
                    <li className="table-cell py-2">
                      <p className="text-sm font-medium text-gray-800">{client.name}</p>
                      <p className="text-xs font-medium text-gray-500">Nombre del Cliente</p>
                    </li>
                    {/* Documento del cliente */}
                    <li className="table-cell">
                      <p className="text-sm font-medium text-gray-800">{client.document}</p>
                      <p className="text-xs font-medium text-gray-500">Documento</p>
                    </li>
                    {/* Fecha de registro del cliente (visible solo en pantallas medianas y superiores) */}
                    <li className="hidden md:table-cell">
                      <p className="text-sm font-medium text-gray-800">{new Date(client.date).toLocaleDateString()}</p>
                      <p className="text-xs font-medium text-gray-500">Fecha Registro</p>
                    </li>
                  </ul>
                </li>
              ))
            ) : (
              // Mensaje cuando no hay clientes registrados hoy.
              <li className="p-2 text-sm font-medium text-gray-500">No hay clientes registrados hoy.</li>
            )}
          </ul>
        </DialogPanel>
      </Dialog>
    </Transition>
  )
}

export default TodayClientsModal; // Exporta el componente para su uso en otras partes de la aplicación.
