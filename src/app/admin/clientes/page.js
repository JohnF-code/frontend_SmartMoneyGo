"use client";

import 'react-toastify/dist/ReactToastify.css';

import { useContext, useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import ModalClient from '@component/components/modalClient';
import ModalLoan from '@component/components/modalLoan';
import ModalInfo from '@component/components/modalInfo';
import ModalPayments from '@component/components/modalPayments';
import { ClientsContext } from '@component/contexts/ClientsContext';
import { AuthContext } from '@component/contexts/AuthContext';
import Searcher from '@component/components/searcher';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashCan,
  faEye,
  faPen,
  faPlus,
  faBars,
  faPhone,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

import { ToastContainer } from 'react-toastify';
import axios from '@component/config/axios';
import { formatearFecha } from '@component/helpers';

/* Capitalizar nombres */
function capitalizeWords(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}

/* Formatear fecha sin segundos */
function formatDateWithoutSeconds(datetimeStr) {
  if (!datetimeStr) return "";
  const [fecha, hora] = datetimeStr.split(" ");
  if (!hora) return fecha;
  const [hh, mm] = hora.split(":");
  return `${fecha} ${hh || "00"}:${mm || "00"}`;
}

export default function Page() {
  const router = useRouter();

  // Contextos
  const { clients = [], deleteClient, getClients } = useContext(ClientsContext);
  const { user } = useContext(AuthContext);

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [showLoan, setShowLoan] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Data
  const [client, setClient] = useState({});
  const [selectedClient, setSelectedClient] = useState({});
  const [loan, setLoan] = useState({});

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(clients.length / itemsPerPage);

  const [currentClients, setCurrentClients] = useState([]);

  // Móvil/Tablet
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);

  // Desktop
  const [desktopMenuOpenId, setDesktopMenuOpenId] = useState(null);

  // Cargar clientes al montar
  useEffect(() => {
    if (typeof getClients === 'function') {
      getClients();
    }
  }, [getClients]);

  useEffect(() => {
    setCurrentClients(paginateClients(clients, currentPage, itemsPerPage));
  }, [currentPage, clients]);

  function paginateClients(arr, pageNumber, pageSize) {
    const startIndex = (pageNumber - 1) * pageSize;
    return arr.slice(startIndex, startIndex + pageSize);
  }

  function handlePreviousPage() {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  }
  function handleNextPage() {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  }
  function handlePageChange(page) {
    setCurrentPage(page);
  }

  // Editar
  const handleEdit = (cli) => {
    setClient(cli);
    setShowModal(true);
  };

  // Limpiar
  const cleanClient = () => {
    setClient({});
  };

  // Móvil/Tablet
  const handleRowClickMobile = (cliId) => {
    if (expandedClientId === cliId) {
      setExpandedClientId(null);
      setMobileActionsOpen(false);
    } else {
      setExpandedClientId(cliId);
      setMobileActionsOpen(false);
    }
  };
  const handleToggleMobileActions = () => {
    setMobileActionsOpen(!mobileActionsOpen);
  };
  const handleCloseMobileDetail = () => {
    setExpandedClientId(null);
    setMobileActionsOpen(false);
  };

  // Desktop
  const handleToggleDesktopMenu = (cliId) => {
    setDesktopMenuOpenId((prev) => (prev === cliId ? null : cliId));
  };

  // Modal Info
  const showModalInfo = async (cli) => {
    try {
      const token = window.localStorage.getItem('token');
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      };
      const loans = await axios(`/loans/${cli._id}`, config);
      setLoan(loans.data);
      setClient(cli);
      setShowInfo(true);
    } catch (error) {
      console.error(error);
    }
  };

  // WATHSAPP
  const handleSendMessage = (phone) => {
    if (!phone) return;
    const cleanNumber = phone.replace(/\D/g, "");
    const url = `https://wa.me/${cleanNumber}`;
    window.open(url, "_blank");
  };

  // LLAMAR
  const handleCall = (phone) => {
    if (!phone) return;
    const cleanNumber = phone.replace(/\D/g, "");
    const url = `tel:${cleanNumber}`;
    window.open(url, "_blank");
  };

  return (
    <>
      {/*
        Overlay con z-40, sin onClick.
        Solo se muestra si hay un modal abierto.
      */}
      {(showModal || showLoan || showInfo || showPayment) && (
        <div
          className="
            fixed
            inset-0
            bg-black
            bg-opacity-50
            z-40
          "
          aria-hidden="true"
        />
      )}

      <div className="relative z-0">
        {/*
          Encabezado
        */}
        <div className="flex flex-wrap items-center justify-between px-6 mb-6 gap-4">
          <div className="flex items-baseline gap-4">
            <h2 className="text-black dark:text-white text-3xl font-extrabold">
              Clientes
            </h2>
            <span className="text-[#2BD6B1] text-2xl font-extrabold">
              &nbsp;&nbsp;{clients.length}
            </span>
          </div>

          <div className="max-w-sm w-full">
            <Searcher setCurrentClients={setCurrentClients} />
          </div>

          {/* Botón Agregar */}
          <div className="relative group inline-block">
            <button
              type="button"
              className="
                bg-[#2BD6B1]
                text-white
                hover:bg-[#ACF2E3]
                hover:text-black
                transition
                transform
                hover:scale-105
                rounded-lg
                text-lg
                px-5
                py-2.5
                text-center
                z-10
              "
              onClick={() => {
                setClient({});
                setShowModal(true);
              }}
            >
              Agregar
            </button>
            <span
              className="
                pointer-events-none
                absolute
                bottom-full
                left-1/2
                -translate-x-1/2
                mb-1
                bg-gray-700
                text-white
                text-base
                px-2
                py-1
                rounded
                opacity-0
                group-hover:opacity-100
                transition
                whitespace-nowrap
              "
            >
              Agregar nuevo cliente
            </span>
          </div>
        </div>

        {/*
          Tabla principal
        */}
        <div className="mx-auto mb-5 px-6">
          <div className="w-full flex flex-col">
            <div className="my-2 overflow-x-visible rounded-lg max-w-full">
              <div className="inline-block min-w-full py-2 align-middle">
                <div className="overflow-visible border border-gray-300 dark:border-gray-500 md:rounded-lg">
                  <table className="table min-w-full font-light text-surface dark:text-white w-full">
                    <thead className="border-b border-neutral-200 bg-[#2BD6B1] font-medium text-white dark:border-white/10 text-left">
                      <tr>
                        {/* Menú (desktop) */}
                        <th
                          scope="col"
                          className="
                            hidden
                            md:table-cell
                            px-4
                            py-4
                            text-xl
                            font-extrabold
                            w-14
                          "
                        >
                          Menú
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-4 text-xl font-extrabold w-14"
                        >
                          #
                        </th>
                        <th
                          scope="col"
                          className="
                            md:w-[50%]
                            py-4
                            text-xl
                            font-extrabold
                          "
                        >
                          Nombre
                        </th>

                        {/* Cédula (Desktop) */}
                        <th
                          scope="col"
                          className="
                            px-2
                            py-4
                            text-xl
                            font-extrabold
                            hidden
                            md:table-cell
                          "
                        >
                          Cédula
                        </th>

                        {/* Contacto (Desktop) */}
                        <th
                          scope="col"
                          className="
                            px-2
                            py-4
                            text-xl
                            font-extrabold
                            hidden
                            md:table-cell
                          "
                        >
                          Contacto
                        </th>
                        {/* Fecha (Desktop) */}
                        <th
                          scope="col"
                          className="
                            px-2
                            py-4
                            text-xl
                            font-extrabold
                            hidden
                            md:table-cell
                          "
                        >
                          Fecha
                        </th>
                      </tr>
                    </thead>

                    <tbody className="text-left">
                      {currentClients.length > 0 ? (
                        currentClients.map((cli, index) => {
                          const rowNumber =
                            (currentPage - 1) * itemsPerPage + (index + 1);
                          const fullName = capitalizeWords(cli.name);
                          const fechaConHoraMin = formatDateWithoutSeconds(
                            formatearFecha(cli.date)
                          );

                          const isDesktopMenuOpen = desktopMenuOpenId === cli._id;

                          return (
                            <Fragment key={cli._id}>
                              <tr
                                className="
                                  border-b
                                  border-neutral-200
                                  dark:border-white/10
                                  hover:bg-white
                                  dark:hover:bg-gray-800
                                "
                              >
                                {/* Menú Desktop */}
                                <td
                                  className="
                                    hidden
                                    md:table-cell
                                    px-4
                                    py-4
                                    align-top
                                    relative
                                  "
                                >
                                  <button
                                    onClick={() => handleToggleDesktopMenu(cli._id)}
                                    className={`
                                      ${
                                        isDesktopMenuOpen
                                          ? 'bg-[#ACF2E3] text-black'
                                          : 'bg-[#2BD6B1] text-white hover:bg-[#ACF2E3] hover:text-black'
                                      }
                                      transition
                                      transform
                                      rounded-lg
                                      px-4
                                      py-2.5
                                      flex
                                      items-center
                                      justify-center
                                      gap-2
                                    `}
                                  >
                                    <FontAwesomeIcon icon={faBars} className="mr-2" />
                                    Menú
                                  </button>

                                  {/* Menú de acciones en Desktop */}
                                  {isDesktopMenuOpen && (
                                    <div
                                      className="
                                        absolute
                                        top-full
                                        left-0
                                        bg-white
                                        dark:bg-gray-800
                                        p-3
                                        border
                                        border-gray-200
                                        dark:border-gray-600
                                        rounded
                                        shadow-lg
                                        mt-2
                                        z-[60]
                                        flex
                                        items-center
                                        gap-2
                                      "
                                    >
                                      {/* PRESTAMOS */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedClient(cli._id);
                                          setShowLoan(true);
                                        }}
                                        className="
                                          bg-[#2BD6B1]
                                          text-white
                                          rounded-lg
                                          px-5
                                          py-2.5
                                          inline-flex
                                          items-center
                                          gap-2
                                        "
                                      >
                                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                        PRESTAMOS
                                      </button>

                                      {/* WATHSAPP (tal cual solicitaste) */}
                                      <button
                                        type="button"
                                        onClick={() => handleSendMessage(cli.contact)}
                                        className="
                                          bg-[#2BD6B1]
                                          text-white
                                          rounded-lg
                                          px-5
                                          py-2.5
                                          inline-flex
                                          items-center
                                          gap-2
                                        "
                                      >
                                        <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
                                        WATHSAPP
                                      </button>

                                      {/* LLAMAR */}
                                      <button
                                        type="button"
                                        onClick={() => handleCall(cli.contact)}
                                        className="
                                          bg-[#2BD6B1]
                                          text-white
                                          rounded-lg
                                          px-5
                                          py-2.5
                                          inline-flex
                                          items-center
                                          gap-2
                                        "
                                      >
                                        <FontAwesomeIcon icon={faPhone} className="mr-2" />
                                        LLAMAR
                                      </button>

                                      {/* DETALLES */}
                                      <button
                                        type="button"
                                        onClick={() => showModalInfo(cli)}
                                        className="
                                          bg-[#2BD6B1]
                                          text-white
                                          rounded-lg
                                          px-5
                                          py-2.5
                                          inline-flex
                                          items-center
                                          gap-2
                                        "
                                      >
                                        <FontAwesomeIcon icon={faEye} className="mr-2" />
                                        DETALLES
                                      </button>

                                      {/* EDITAR (solo admin) */}
                                      {user?.role === 'administrador' && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleEdit(cli)}
                                            className="
                                              bg-[#2BD6B1]
                                              text-white
                                              rounded-lg
                                              px-5
                                              py-2.5
                                              inline-flex
                                              items-center
                                              gap-2
                                            "
                                          >
                                            <FontAwesomeIcon icon={faPen} className="mr-2" />
                                            EDITAR
                                          </button>

                                          {/* ELIMINAR */}
                                          <button
                                            type="button"
                                            onClick={() => deleteClient(cli._id)}
                                            className="
                                              bg-[#2BD6B1]
                                              text-white
                                              rounded-lg
                                              px-5
                                              py-2.5
                                              inline-flex
                                              items-center
                                              gap-2
                                            "
                                          >
                                            <FontAwesomeIcon
                                              icon={faTrashCan}
                                              className="mr-2"
                                            />
                                            ELIMINAR
                                          </button>
                                        </>
                                      )}

                                      {/* CERRAR */}
                                      <button
                                        type="button"
                                        onClick={() => handleToggleDesktopMenu(cli._id)}
                                        className="
                                          bg-[#2BD6B1]
                                          text-white
                                          rounded-lg
                                          px-5
                                          py-2.5
                                          inline-flex
                                          items-center
                                          gap-2
                                        "
                                      >
                                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                                        CERRAR
                                      </button>
                                    </div>
                                  )}
                                </td>

                                {/* Número */}
                                <td
                                  className="
                                    px-4
                                    py-4
                                    font-extrabold
                                    text-black
                                    dark:text-white
                                    align-top
                                    whitespace-nowrap
                                  "
                                  onClick={() => {
                                    if (window.innerWidth < 768) {
                                      handleRowClickMobile(cli._id);
                                    }
                                  }}
                                >
                                  {rowNumber}
                                </td>

                                {/* Nombre */}
                                <td
                                  className="
                                    px-4
                                    py-4
                                    text-black
                                    dark:text-white
                                    align-top
                                    whitespace-nowrap
                                  "
                                  onClick={() => {
                                    if (window.innerWidth < 768) {
                                      handleRowClickMobile(cli._id);
                                    }
                                  }}
                                >
                                  <span className="font-bold">{fullName}</span>
                                </td>

                                {/* Cédula */}
                                <td
                                  className="
                                    hidden
                                    md:table-cell
                                    text-black
                                    dark:text-white
                                    whitespace-nowrap
                                    align-top
                                    px-2
                                    py-4
                                  "
                                >
                                  {cli.document}
                                </td>

                                {/* Contacto */}
                                <td
                                  className="
                                    hidden
                                    md:table-cell
                                    text-black
                                    dark:text-white
                                    whitespace-nowrap
                                    align-top
                                    px-2
                                    py-4
                                  "
                                >
                                  {cli.contact}
                                </td>

                                {/* Fecha */}
                                <td
                                  className="
                                    hidden
                                    md:table-cell
                                    text-black
                                    dark:text-white
                                    whitespace-nowrap
                                    align-top
                                    px-2
                                    py-4
                                  "
                                >
                                  {fechaConHoraMin}
                                </td>
                              </tr>

                              {/* Móvil/Tablet: Fila expandida */}
                              {expandedClientId === cli._id && (
                                <tr className="md:hidden">
                                  <td
                                    colSpan={6}
                                    className="
                                      bg-white
                                      dark:bg-slate-700
                                      p-4
                                      text-black
                                      dark:text-white
                                    "
                                  >
                                    {/* Leyenda "Acciones" */}
                                    <div
                                      className="
                                        flex
                                        items-center
                                        gap-2
                                        cursor-pointer
                                        mb-4
                                        transition
                                        transform
                                        hover:scale-105
                                      "
                                      onClick={handleToggleMobileActions}
                                    >
                                      <FontAwesomeIcon
                                        icon={faBars}
                                        className="mr-2 text-2xl"
                                      />
                                      <span className="text-xl font-bold">
                                        Acciones
                                      </span>
                                    </div>

                                    {/*
                                      Botón PRESTAMOS siempre visible
                                    */}
                                    <div className="mb-4">
                                      <button
                                        type="button"
                                        className="
                                          bg-[#2BD6B1]
                                          text-white
                                          rounded-lg
                                          w-full
                                          px-5
                                          py-3
                                          inline-flex
                                          items-center
                                          gap-2
                                          justify-center
                                        "
                                        onClick={() => {
                                          setSelectedClient(cli._id);
                                          setShowLoan(true);
                                        }}
                                      >
                                        <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                        PRESTAMOS
                                      </button>
                                    </div>

                                    {mobileActionsOpen && (
                                      <div
                                        className="
                                          mb-4
                                          flex
                                          flex-col
                                          gap-3
                                          items-start
                                          w-full
                                        "
                                      >
                                        {/* WATHSAPP */}
                                        <button
                                          type="button"
                                          className="
                                            bg-[#2BD6B1]
                                            text-white
                                            rounded-lg
                                            px-5
                                            py-3
                                            inline-flex
                                            items-center
                                            gap-2
                                            w-full
                                            justify-center
                                          "
                                          onClick={() => handleSendMessage(cli.contact)}
                                        >
                                          <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
                                          WATHSAPP
                                        </button>

                                        {/* LLAMAR */}
                                        <button
                                          type="button"
                                          className="
                                            bg-[#2BD6B1]
                                            text-white
                                            rounded-lg
                                            px-5
                                            py-3
                                            inline-flex
                                            items-center
                                            gap-2
                                            w-full
                                            justify-center
                                          "
                                          onClick={() => handleCall(cli.contact)}
                                        >
                                          <FontAwesomeIcon icon={faPhone} className="mr-2" />
                                          LLAMAR
                                        </button>

                                        {/* DETALLES */}
                                        <button
                                          type="button"
                                          className="
                                            bg-[#2BD6B1]
                                            text-white
                                            rounded-lg
                                            px-5
                                            py-3
                                            inline-flex
                                            items-center
                                            gap-2
                                            w-full
                                            justify-center
                                          "
                                          onClick={() => showModalInfo(cli)}
                                        >
                                          <FontAwesomeIcon icon={faEye} className="mr-2" />
                                          DETALLES
                                        </button>

                                        {/* EDITAR / ELIMINAR (admin) */}
                                        {user?.role === 'administrador' && (
                                          <>
                                            <button
                                              type="button"
                                              className="
                                                bg-[#2BD6B1]
                                                text-white
                                                rounded-lg
                                                px-5
                                                py-3
                                                inline-flex
                                                items-center
                                                gap-2
                                                w-full
                                                justify-center
                                              "
                                              onClick={() => handleEdit(cli)}
                                            >
                                              <FontAwesomeIcon icon={faPen} className="mr-2" />
                                              EDITAR
                                            </button>
                                            <button
                                              type="button"
                                              className="
                                                bg-[#2BD6B1]
                                                text-white
                                                rounded-lg
                                                px-5
                                                py-3
                                                inline-flex
                                                items-center
                                                gap-2
                                                w-full
                                                justify-center
                                              "
                                              onClick={() => deleteClient(cli._id)}
                                            >
                                              <FontAwesomeIcon icon={faTrashCan} className="mr-2" />
                                              ELIMINAR
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}

                                    {/* Datos del cliente */}
                                    <p className="mb-2">
                                      <span className="font-bold">Nombre:</span>{' '}
                                      {fullName}
                                    </p>
                                    <p className="mb-2">
                                      <span className="font-bold">Cédula:</span>{' '}
                                      {cli.document}
                                    </p>
                                    <p className="mb-2">
                                      <span className="font-bold">Contacto:</span>{' '}
                                      {cli.contact}
                                    </p>
                                    <p className="mb-2">
                                      <span className="font-bold">Fecha:</span>{' '}
                                      {fechaConHoraMin}
                                    </p>

                                    {/* Botón ATRAS */}
                                    <button
                                      type="button"
                                      className="
                                        bg-[#2BD6B1]
                                        text-white
                                        rounded-lg
                                        px-4
                                        py-2.5
                                        mt-2
                                        inline-flex
                                        items-center
                                        gap-2
                                      "
                                      onClick={handleCloseMobileDetail}
                                    >
                                      ATRAS
                                    </button>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-4 text-center">
                            No hay clientes para mostrar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Paginación */}
            <div className="flex justify-center space-x-2 mt-4">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="
                  px-3
                  py-1
                  bg-gray-300
                  text-black
                  rounded
                  hover:bg-gray-400
                  hover:text-zinc-900
                  disabled:opacity-50
                "
              >
                Anterior
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`
                      px-3
                      py-1
                      rounded
                      transition
                      ${
                        currentPage === page
                          ? 'bg-[#2BD6B1] text-white hover:text-zinc-900'
                          : 'bg-gray-300 text-black hover:bg-gray-400 hover:text-zinc-900'
                      }
                    `}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="
                  px-3
                  py-1
                  bg-gray-300
                  text-black
                  rounded
                  hover:bg-gray-400
                  hover:text-zinc-900
                  disabled:opacity-50
                "
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*
        Modales en z-[60] para asegurarnos que queden sobre el overlay (z-40).
      */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <ModalClient
            showModal={showModal}
            setShowModal={setShowModal}
            client={client}
            cleanClient={cleanClient}
          />
        </div>
      )}

      {showPayment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <ModalPayments
            showPayment={showPayment}
            setShowPayment={setShowPayment}
          />
        </div>
      )}

      {showLoan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <ModalLoan
            showLoan={showLoan}
            setShowLoan={setShowLoan}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            setPrestamo={() => {}}
          />
        </div>
      )}

      {showInfo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <ModalInfo
            loan={loan}
            client={client}
            showInfo={showInfo}
            setShowInfo={setShowInfo}
            selectedClient={selectedClient}
          />
        </div>
      )}

      <ToastContainer />
    </>
  );
}
