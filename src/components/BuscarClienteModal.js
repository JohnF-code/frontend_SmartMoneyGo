// JohnF-code Jajajaja
// /components/BuscarClienteModal.js

"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Button from "@component/components/Button";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import clientDB from "../db/clientDB.js";  // Para búsquedas offline

export default function BuscarClienteModal({ show, onClose, onClientSelected }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleBuscar = async () => {
    setError("");
    if (navigator.onLine) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/clients?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data || data.length === 0) {
            setResults([]);
            setError("No se encontró el cliente. Asegúrese de ingresar el nombre, cédula o contacto correctamente.");
          } else {
            setResults(data);
          }
        })
        .catch((err) => {
          setError("Error al buscar el cliente.");
          console.error(err);
        });
    } else {
      try {
        const allClients = await clientDB.db.getAll("clients");
        const filtered = allClients.filter(client =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.contact.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filtered.length === 0) {
          setError("No se encontró el cliente en el almacenamiento local.");
        }
        setResults(filtered);
      } catch (err) {
        setError("Error al buscar el cliente offline.");
        console.error(err);
      }
    }
  };

  const handleSelectClient = (client) => {
    onClientSelected(client);
    onClose();
  };

  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
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
              <FontAwesomeIcon icon={faUser} className="text-4xl text-primary mx-auto" />
              <h2 className="text-xl font-bold mt-2">Buscar Cliente</h2>
              <p className="text-sm text-gray-600">para nuevo préstamo</p>
            </div>
            <div className="mb-4 relative">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Nombre, cédula o contacto"
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
            <div className="flex justify-center mb-4">
              <Button variant="primary" onClick={handleBuscar}>
                Buscar
              </Button>
            </div>
            {results.length > 0 && (
              <div className="max-h-48 overflow-y-auto border rounded p-2">
                {results.map((client) => (
                  <div
                    key={client.id || client._id}
                    className="p-2 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectClient(client)}
                  >
                    <p className="font-bold">{client.name}</p>
                    <p className="text-xs text-gray-600">
                      {client.document} - {client.contact}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Dialog>
      <ToastContainer />
    </Transition>
  );
}
