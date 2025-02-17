"use client";

import { useState, useEffect, useRef, Fragment, useContext } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Button from "@component/components/Button";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClientsContext } from "@component/contexts/ClientsContext";
import { LoansContext } from "@component/contexts/LoansContext";
import ModalClient from "./modalClient";

export default function SeleccionarClienteModal({
  show,
  onClose,
  onClientSelected
}) {
  const { getClients, clients } = useContext(ClientsContext);
  const { loans } = useContext(LoansContext);

  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [client, setClient] = useState({});

  // Modal Cliente
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getClients();
  }, []);

  useEffect(() => {
    let filtered = [];
    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    if (lowerSearchTerm === "") {
      // Si no hay término de búsqueda, mostrar solo los clientes favoritos
      filtered = clients.filter((client) => client.favorite);
    } else {
      // Primero, buscar en la lista de favoritos utilizando indexOf
      filtered = clients.filter(
        (client) =>
          client.favorite &&
          (
            (client.name && client.name.toLowerCase().indexOf(lowerSearchTerm) !== -1) ||
            (client.document && String(client.document).toLowerCase().indexOf(lowerSearchTerm) !== -1) ||
            (client.contact && String(client.contact).toLowerCase().indexOf(lowerSearchTerm) !== -1)
          )
      );

      // Si no se encuentra en favoritos, buscar en todos los clientes
      if (filtered.length === 0) {
        filtered = clients.filter(
          (client) =>
            (client.name && client.name.toLowerCase().indexOf(lowerSearchTerm) !== -1) ||
            (client.document && String(client.document).toLowerCase().indexOf(lowerSearchTerm) !== -1) ||
            (client.contact && String(client.contact).toLowerCase().indexOf(lowerSearchTerm) !== -1)
        );
      }
    }

    setFavorites(filtered);
  }, [loans, clients, searchTerm]);

  const handleSelectClient = (client) => {
    onClientSelected(client);
    onClose();
  };

  // Limpiar
  function cleanClient() {
    setClient({});
  }

  return (
    <>
      <Transition appear show={show} as={Fragment}>
        <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" 
            enterFrom="opacity-0" 
            enterTo="opacity-100"
            leave="ease-in duration-200" 
            leaveFrom="opacity-100" 
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow max-w-md w-full p-6">
              <div className="flex justify-end">
                <button onClick={onClose} className="text-primary font-bold">
                  Cerrar
                </button>
              </div>
              <div className="text-center mb-4">
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-4xl text-primary mx-auto"
                />
                <h2 className="text-xl font-bold mt-2">Buscar Cliente</h2>
                <p className="text-sm text-gray-600">
                  Selecciona un cliente para agregar un nuevo préstamo.
                </p>
              </div>
              <div className="mb-4 relative">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre, cédula o contacto"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {error && (
                <div className="bg-pink-100 text-red-600 p-2 rounded mb-4">
                  {error}
                </div>
              )}
              <div className="max-h-64 overflow-y-auto border rounded mb-4">
                {loading ? (
                  <p className="p-2 text-center">Cargando...</p>
                ) : favorites.length > 0 ? (
                  favorites.map((client) => {
                    return (
                      <div
                        key={client._id}
                        onClick={() => handleSelectClient(client)}
                        className={`p-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-100 ${
                          (client.name?.toLowerCase() === searchTerm.trim().toLowerCase() ||
                            String(client.document).toLowerCase() === searchTerm.trim().toLowerCase() ||
                            String(client.contact).toLowerCase() === searchTerm.trim().toLowerCase())
                            ? "bg-secondary" // Resaltar coincidencia exacta (fondo secondary, texto en negro)
                            : ""
                        }`}
                      >
                        <p className="font-bold text-black">{client.name}</p>
                        <p className="text-xs text-gray-600">
                          {client.document} - {client.contact}
                        </p>
                      </div>
                    )
                  })
                ) : (
                  <p className="p-2 text-center text-gray-500">No hay clientes para mostrar.</p>
                )}
              </div>
              <div className="text-center">
                <p className="mb-2 text-sm text-gray-600">
                  Si no estás en la lista de clientes, agrégate aquí:
                </p>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                  Agregar Cliente
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
        <ToastContainer />
      </Transition>
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <ModalClient
            showModal={showModal}
            setShowModal={setShowModal}
            client={client}
            cleanClient={cleanClient}
            onClose={onClose}
          />
        </div>
      )}
    </>
  );
}
