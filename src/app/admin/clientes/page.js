"use client";

import "react-toastify/dist/ReactToastify.css";
import { useContext, useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";

// Importar tus componentes de modal
import ModalClient from "@component/components/modalClient";
import ModalLoan from "@component/components/modalLoan";
import ModalInfo from "@component/components/ModalInfo";
import ModalPayments from "@component/components/modalPayments"; // Corregido: 'modalPayments' en lugar de 'ModalPayments'
import NuevoPrestamoModal from "@component/components/NuevoPrestamoModal";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

// Contextos
import { ClientsContext } from "@component/contexts/ClientsContext";
import { LoansContext } from "@component/contexts/LoansContext";
import { AuthContext } from "@component/contexts/AuthContext";

// Buscador + helper axios
import Searcher from "@component/components/searcher";
import axios from "@component/config/axios";

// Iconos
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashCan,
  faEye,
  faPen,
  faPlus,
  faBars,
  faPhone,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

// Importar jsPDF para generar PDF
import { jsPDF } from "jspdf";

// Estilos + notificaciones
import { ToastContainer } from "react-toastify";
import { formatearFecha } from "@component/helpers";
import Button from "@component/components/Button";

function capitalizeWords(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatDateWithoutSeconds(datetimeStr) {
  if (!datetimeStr) return "";
  const [fecha, hora] = datetimeStr.split(" ");
  if (!hora) return fecha;
  const [hh, mm] = hora.split(":");
  return `${fecha} ${hh || "00"}:${mm || "00"}`;
}

// Función para generar PDF usando jsPDF
const generatePDF = (callback) => {
  const pdf = new jsPDF();
  // Agrega algún contenido si es necesario:
  pdf.text("clientes", 10, 10);
  callback(pdf);
};

const exportToPDF = () => {
  generatePDF((pdf) => {
    pdf.save("clientes.pdf");
  });
};

const sendViaWhatsApp = () => {
  generatePDF((pdf) => {
    const blob = pdf.output("blob");
    const formData = new FormData();
    formData.append("pdf", blob, "clientes.pdf");
    const uploadUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/upload`;
    const token = localStorage.getItem("token");
    fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return res.json();
      })
      .then((data) => {
        if (data.url) {
          const message = encodeURIComponent("Adjunto PDF de clientes: " + data.url);
          window.open(`https://wa.me/?text=${message}`, "_blank");
        } else {
          alert("Error al subir el PDF");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Error al enviar el PDF por WhatsApp");
      });
  });
};

export default function Page() {
  const router = useRouter();

  // Contextos
  const { clients = [], deleteClient, getClients } = useContext(ClientsContext);
  const { addLoan } = useContext(LoansContext);
  const { user } = useContext(AuthContext);

  // Estados modales
  const [showModal, setShowModal] = useState(false);
  const [showLoan, setShowLoan] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Datos del cliente seleccionado
  const [client, setClient] = useState({});
  const [selectedClient, setSelectedClient] = useState({});
  const [loan, setLoan] = useState({});

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const totalPages = Math.ceil(clients.length / itemsPerPage);

  // Lista de clientes a mostrar (se invierte el arreglo para que el nuevo aparezca primero)
  const [currentClients, setCurrentClients] = useState([]);

  useEffect(() => {
    const reversedClients = [...clients].reverse();
    setCurrentClients(paginateClients(reversedClients, currentPage, itemsPerPage));
  }, [currentPage, clients]);

  // Renglón resaltado o expandido
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);

  // Menú Desktop expandido
  const [desktopMenuOpenId, setDesktopMenuOpenId] = useState(null);

  // Efecto: al montar, obtener clientes
  useEffect(() => {
    if (typeof getClients === "function") {
      getClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para paginar
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

  // Editar un cliente
  function handleEdit(cli) {
    setClient(cli);
    setShowModal(true);
  }

  // Limpiar
  function cleanClient() {
    setClient({});
  }

  // Móvil => expandir
  function handleRowClickMobile(cliId) {
    if (expandedClientId === cliId) {
      // cerrar
      setExpandedClientId(null);
      setMobileActionsOpen(false);
      setHighlightedRowId(null);
    } else {
      if (expandedClientId && expandedClientId !== cliId) {
        unHighlightRow(expandedClientId);
      }
      setExpandedClientId(cliId);
      setMobileActionsOpen(false);
      setHighlightedRowId(cliId);
    }
  }

  function handleToggleMobileActions() {
    setMobileActionsOpen(!mobileActionsOpen);
  }

  function handleCloseMobileDetail() {
    if (expandedClientId) unHighlightRow(expandedClientId);
    setExpandedClientId(null);
    setMobileActionsOpen(false);
  }

  // Desktop => menú
  function handleToggleDesktopMenu(cliId) {
    if (desktopMenuOpenId === cliId) {
      setDesktopMenuOpenId(null);
      unHighlightRow(cliId);
    } else {
      if (desktopMenuOpenId && desktopMenuOpenId !== cliId) {
        unHighlightRow(desktopMenuOpenId);
      }
      setDesktopMenuOpenId(cliId);
      highlightRow(cliId);
    }
  }

  async function showModalInfo(cli) {
    try {
      const token = window.localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      // Petición para obtener info del préstamo de ese cliente
      const resp = await axios.get(`/loans/${cli._id}`, config);
      setLoan(resp.data);
      setClient(cli);
      setShowInfo(true);
    } catch (error) {
      console.error(error);
    }
  }

  // WhatsApp
  function handleSendMessage(phone) {
    if (!phone) return;
    const cleanNumber = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
  }

  // Llamar
  function handleCall(phone) {
    if (!phone) return;
    const cleanNumber = phone.replace(/\D/g, "");
    window.open(`tel:${cleanNumber}`, "_blank");
  }

  function highlightRow(rowId) {
    setHighlightedRowId(rowId);
  }

  function unHighlightRow(rowId) {
    if (highlightedRowId === rowId) {
      setHighlightedRowId(null);
    }
  }
  
  // Render
  return (
    <>
      {/* Si tenemos modales, creamos overlay al fondo */}
      {(showModal || showLoan || showInfo || showPayment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}

      <div className="relative z-0">
        {/* Encabezado */}
        <div className="flex flex-wrap items-center justify-between px-6 mb-6 gap-4">
          <div className="flex items-baseline gap-4">
            <h2 className="text-black dark:text-white text-3xl font-extrabold">
              Clientes
            </h2>
            <span className="text-primary text-2xl font-extrabold">
              &nbsp;&nbsp;{clients.length}
            </span>
          </div>

          {/* Buscador local */}
          <div className="max-w-sm w-full">
            <Searcher
              clients={clients}
              setCurrentClients={setCurrentClients}
              placeholder="Buscar Cliente (nombre, cédula o teléfono)..."
            />
          </div>

          {/* Botón Agregar */}
          <div className="relative group inline-block">
            <Button
              onClick={() => {
                setClient({});
                setShowModal(true);
              }}
              variant="primary"
              className="text-lg"
            >
              Agregar
            </Button>
            <span
              className="
                pointer-events-none absolute bottom-full left-1/2
                -translate-x-1/2 mb-1 bg-gray-700 text-white text-base
                px-2 py-1 rounded opacity-0 group-hover:opacity-100
                transition whitespace-nowrap
              "
            >
              Agregar nuevo cliente
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={exportToPDF}
            className="flex items-center text-sm md:text-base text-black dark:text-white hover:text-primary transition-colors"
          >
            <FontAwesomeIcon icon={faDownload} className="ml-10 mr-2" />
            Descargar
          </button>

          <button
            onClick={sendViaWhatsApp}
            className="flex items-center text-sm md:text-base text-black dark:text-white hover:text-primary transition-colors"
          >
            <FontAwesomeIcon icon={faWhatsapp} className=" ml-6 mr-2" />
            Enviar
          </button>
        </div>

        {/* Tabla principal */}
        <div className="mx-auto mb-5 px-6">
          <div className="w-full flex flex-col">
            <div className="my-2 overflow-x-visible rounded-lg max-w-full">
              <div className="inline-block min-w-full py-2 align-middle">
                <div className="overflow-visible border border-gray-300 dark:border-gray-500 md:rounded-lg">
                  <table className="table min-w-full font-light text-surface dark:text-white w-full">
                    <thead className="border-b border-neutral-200 bg-primary font-medium text-white dark:border-white/10 text-left">
                      <tr>
                        <th
                          scope="col"
                          className="hidden md:table-cell px-4 py-2 text-xl font-extrabold w-14"
                        />
                        <th
                          scope="col"
                          className="px-4 py-2 text-xl font-extrabold w-14"
                        >
                          #
                        </th>
                        <th
                          scope="col"
                          className="md:w-[50%] py-2 text-xl font-extrabold"
                        >
                          Nombre
                        </th>
                        {/* Cédula */}
                        <th
                          scope="col"
                          className="px-2 py-2 text-xl font-extrabold hidden md:table-cell"
                        >
                          Cédula
                        </th>
                        {/* Contacto */}
                        <th
                          scope="col"
                          className="px-2 py-2 text-xl font-extrabold hidden md:table-cell"
                        >
                          Contacto
                        </th>
                        {/* Fecha */}
                        <th
                          scope="col"
                          className="px-2 py-2 text-xl font-extrabold hidden md:table-cell"
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
                          const isDesktopOpen = desktopMenuOpenId === cli._id;
                          const isHL = highlightedRowId === cli._id;
                          const rowStyle = {
                            backgroundColor: isHL ? "#D4FFF6" : "",
                            color: isHL ? "black" : "",
                          };

                          return (
                            <Fragment key={cli._id}>
                              <tr
                                className="border-b border-neutral-200 dark:border-white/10 hover:bg-white dark:hover:bg-gray-800"
                                style={rowStyle}
                              >
                                {/* Menú Desktop */}
                                <td className="hidden md:table-cell px-4 py-2 align-top relative">
                                  <button
                                    onClick={() =>
                                      handleToggleDesktopMenu(cli._id)
                                    }
                                    className={`transition transform rounded-lg flex items-center justify-center h-10 w-10 ${
                                      isDesktopOpen
                                        ? "bg-[#D4FFF6] rotate-[90deg] text-black dark:text-black"
                                        : "hover:scale-105 text-black dark:text-white"
                                    }`}
                                    style={{ fontSize: "1.1rem" }}
                                  >
                                    <FontAwesomeIcon icon={faBars} />
                                  </button>
                                </td>

                                {/* Número */}
                                <td
                                  className="px-4 py-2 font-extrabold text-black dark:text-white align-top whitespace-nowrap"
                                  style={rowStyle}
                                  onClick={() => {
                                    // Mobile => expandir
                                    if (window.innerWidth < 768) {
                                      handleRowClickMobile(cli._id);
                                    }
                                  }}
                                >
                                  {rowNumber}
                                </td>

                                {/* Nombre */}
                                <td
                                  className="px-4 py-2 text-black dark:text-white align-top whitespace-nowrap cursor-pointer"
                                  style={rowStyle}
                                  onClick={() => {
                                    // Desktop => toggle menú
                                    if (window.innerWidth >= 768) {
                                      handleToggleDesktopMenu(cli._id);
                                    } else {
                                      handleRowClickMobile(cli._id);
                                    }
                                  }}
                                >
                                  <span className="font-bold">{fullName}</span>
                                </td>

                                {/* Cédula */}
                                <td
                                  className="hidden md:table-cell text-black dark:text-white whitespace-nowrap align-top px-2 py-2"
                                  style={rowStyle}
                                >
                                  {cli.document}
                                </td>

                                {/* Contacto */}
                                <td
                                  className="hidden md:table-cell text-black dark:text-white whitespace-nowrap align-top px-2 py-2"
                                  style={rowStyle}
                                >
                                  {cli.contact}
                                </td>

                                {/* Fecha */}
                                <td
                                  className="hidden md:table-cell text-black dark:text-white whitespace-nowrap align-top px-2 py-2"
                                  style={rowStyle}
                                >
                                  {fechaConHoraMin}
                                </td>
                              </tr>

                              {/* Menú Desktop expandido */}
                              {isDesktopOpen && (
                                <tr className="hidden md:table-row">
                                  <td
                                    colSpan={6}
                                    className="
                                      p-3 border-b border-neutral-200
                                      dark:border-white/10
                                      text-black dark:text-white
                                      bg-white dark:bg-gray-800
                                    "
                                  >
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {/* Prestamos */}
                                      <Button
                                        onClick={() => {
                                          setSelectedClient(cli);
                                          setShowLoan(true);
                                        }}
                                        variant="primary"
                                      >
                                        <FontAwesomeIcon icon={faPlus} />
                                      </Button>

                                      {/* WhatsApp */}
                                      <Button
                                        onClick={() =>
                                          handleSendMessage(cli.contact)
                                        }
                                        variant="primary"
                                      >
                                        <FontAwesomeIcon icon={faWhatsapp} />
                                      </Button>

                                      {/* Llamar */}
                                      <Button
                                        onClick={() => handleCall(cli.contact)}
                                        variant="primary"
                                      >
                                        <FontAwesomeIcon icon={faPhone} />
                                      </Button>

                                      {/* Detalles */}
                                      <Button
                                        onClick={() => showModalInfo(cli)}
                                        variant="primary"
                                      >
                                        <FontAwesomeIcon icon={faEye} />
                                        DETALLES
                                      </Button>

                                      {/* Editar/Eliminar => admin */}
                                      {user?.role === "administrador" && (
                                        <>
                                          <Button
                                            onClick={() => handleEdit(cli)}
                                            variant="primary"
                                          >
                                            <FontAwesomeIcon icon={faPen} />
                                            EDITAR
                                          </Button>
                                          <Button
                                            onClick={() =>
                                              deleteClient(cli._id)
                                            }
                                            variant="primary"
                                          >
                                            <FontAwesomeIcon icon={faTrashCan} />
                                          </Button>
                                        </>
                                      )}

                                      {/* Cerrar */}
                                      <Button
                                        onClick={() =>
                                          handleToggleDesktopMenu(cli._id)
                                        }
                                        variant="primary"
                                      >
                                        <FontAwesomeIcon icon={faTimes} />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )}

                              {/* Fila expandida modo móvil/tablet */}
                              {expandedClientId === cli._id && (
                                <tr
                                  style={{
                                    backgroundColor: "#D4FFF6",
                                    color: "black",
                                  }}
                                  className="md:hidden"
                                >
                                  <td colSpan={6} className="p-4 dark:text-black">
                                    <div
                                      className="
                                        flex items-center gap-2 cursor-pointer
                                        mb-4 transition transform
                                        hover:scale-105
                                      "
                                      onClick={handleToggleMobileActions}
                                    >
                                      <FontAwesomeIcon
                                        icon={faBars}
                                        className={`mr-2 text-2xl ${
                                          mobileActionsOpen
                                            ? "rotate-[90deg]"
                                            : ""
                                        } text-black`}
                                      />
                                    </div>

                                    {/* Prestamos */}
                                    <div className="mb-4">
                                      <Button
                                        type="button"
                                        variant="primary"
                                        className="w-full"
                                        onClick={() => {
                                          setSelectedClient(cli._id);
                                          setShowLoan(true);
                                        }}
                                      >
                                        <FontAwesomeIcon icon={faPlus} />
                                        PRESTAMOS
                                      </Button>
                                    </div>

                                    {/* Acciones móviles */}
                                    {mobileActionsOpen && (
                                      <div className="mb-4 flex flex-col gap-3 items-start w-full">
                                        <Button
                                          variant="primary"
                                          className="w-full"
                                          onClick={() =>
                                            handleSendMessage(cli.contact)
                                          }
                                        >
                                          <FontAwesomeIcon icon={faWhatsapp} />
                                          WhatsApp
                                        </Button>

                                        <Button
                                          variant="primary"
                                          className="w-full"
                                          onClick={() => handleCall(cli.contact)}
                                        >
                                          <FontAwesomeIcon icon={faPhone} />
                                          LLAMAR
                                        </Button>

                                        <Button
                                          variant="primary"
                                          className="w-full"
                                          onClick={() => showModalInfo(cli)}
                                        >
                                          <FontAwesomeIcon icon={faEye} />
                                          DETALLES
                                        </Button>

                                        {user?.role === "administrador" && (
                                          <>
                                            <Button
                                              variant="primary"
                                              className="w-full"
                                              onClick={() => handleEdit(cli)}
                                            >
                                              <FontAwesomeIcon icon={faPen} />
                                              EDITAR
                                            </Button>
                                            <Button
                                              variant="primary"
                                              className="w-full"
                                              onClick={() =>
                                                deleteClient(cli._id)
                                              }
                                            >
                                              <FontAwesomeIcon icon={faTrashCan} />
                                              ELIMINAR
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    )}

                                    {/* Datos del cliente */}
                                    <p className="mb-2">
                                      <span className="font-bold">Nombre:</span>{" "}
                                      {fullName}
                                    </p>
                                    <p className="mb-2">
                                      <span className="font-bold">Cédula:</span>{" "}
                                      {cli.document}
                                    </p>
                                    <p className="mb-2">
                                      <span className="font-bold">
                                        Contacto:
                                      </span>{" "}
                                      {cli.contact}
                                    </p>
                                    <p className="mb-2">
                                      <span className="font-bold">Fecha:</span>{" "}
                                      {fechaConHoraMin}
                                    </p>

                                    <Button
                                      variant="primary"
                                      className="mt-2 px-4 py-2.5"
                                      onClick={handleCloseMobileDetail}
                                    >
                                      ATRAS
                                    </Button>
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
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                variant="secondary"
              >
                Anterior
              </Button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    variant={currentPage === page ? "primary" : "secondary"}
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                variant="secondary"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modales */}
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
      {/*{showLoan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <ModalLoan
            showLoan={showLoan}
            setShowLoan={setShowLoan}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            setPrestamo={() => {}}
          />
        </div>
      )}*/}
          
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

      {showLoan && selectedClient && (
        <NuevoPrestamoModal
          show={showLoan}
          onClose={() => setShowLoan(false)}
          client={selectedClient}
          onSave={(newLoanData) => {
            addLoan(newLoanData);
          }}
        />
      )}

      <ToastContainer />
    </>
  );
}
