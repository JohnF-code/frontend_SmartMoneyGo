// JohnF-code Jajajaja
// /src/pages/admin/prestamos/page.js

"use client";

import { useContext, useState, useEffect, Fragment } from "react";
import { LoansContext } from "@component/contexts/LoansContext";
import { ClientsContext } from "@component/contexts/ClientsContext";
import { AuthContext } from "@component/contexts/AuthContext";
import ModalLoan from "@component/components/modalLoan";
import ModalPayments from "@component/components/modalPayments";
import SeleccionarClienteModal from "@component/components/SeleccionarClienteModal";
import NuevoPrestamoModal from "@component/components/NuevoPrestamoModal";
import ModalLoanDetail from "@component/components/ModalLoanDetail";
import Button from "@component/components/Button";
import { formatearFecha, formatearNumero } from "@component/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faDollarSign, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "@component/config/axios";

// Importaciones de dnd-kit
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from "@dnd-kit/sortable";

// Componente para cada fila draggable
function SortableRow({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    cursor: "grab",
    backgroundColor: "#f0f8ff" // Indicador visual de que es draggable
  };
  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </tr>
  );
}

const capitalizarNombre = (str) => {
  if (!str) return "";
  return str
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
};

const getLoanStatus = (loan) => {
  if (loan.balance <= 0) return "alDia";
  const now = new Date();
  const finish = new Date(loan.finishDate);
  const diffDays = Math.ceil((finish - now) / (1000 * 60 * 60 * 24));
  if (diffDays > 7) return "alDia";
  if (diffDays >= 0 && diffDays <= 7) return "proximo";
  if (diffDays < 0) return "enMora";
  return "";
};

const getLoanProgress = (loan) => {
  const totalCuotas = loan.installments;
  const cuotaValor = loan.installmentValue;
  const totalPrestamo = totalCuotas * cuotaValor;
  const cuotasPagadas = Math.floor((totalPrestamo - loan.balance) / cuotaValor);
  const progress = (cuotasPagadas / totalCuotas) * 100;
  return { cuotasPagadas, totalCuotas, cuotaValor, progress };
};

// Función de ordenamiento para otros criterios
const sortLoans = (loans, sortField, sortOrder) => {
  if (!sortField) return loans;
  return [...loans].sort((a, b) => {
    let aValue, bValue;
    if (sortField === "cliente") {
      aValue = a.clientId?.name?.toLowerCase() || "";
      bValue = b.clientId?.name?.toLowerCase() || "";
    } else if (sortField === "saldo") {
      aValue = a.balance;
      bValue = b.balance;
    } else if (sortField === "cuotas") {
      const aProgress = getLoanProgress(a).cuotasPagadas;
      const bProgress = getLoanProgress(b).cuotasPagadas;
      aValue = aProgress;
      bValue = bProgress;
    } else if (sortField === "fecha") {
      aValue = new Date(a.date);
      bValue = new Date(b.date);
    }
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
};

const generatePDF = (callback) => {
  const input = document.getElementById("exportContainer");
  html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imageHeight = (imgProps.height * pdfWidth) / imgProps.width;
    let heightLeft = imageHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imageHeight);
    heightLeft -= pdfHeight;
    while (heightLeft > 0) {
      position = heightLeft - imageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imageHeight);
      heightLeft -= pdfHeight;
    }
    callback(pdf);
  });
};

const exportToPDF = () => {
  generatePDF((pdf) => {
    pdf.save("prestamos_activos.pdf");
  });
};

const sendViaWhatsApp = () => {
  generatePDF((pdf) => {
    const blob = pdf.output("blob");
    const formData = new FormData();
    formData.append("pdf", blob, "prestamos_activos.pdf");
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
          const message = encodeURIComponent("Adjunto PDF de Préstamos Activos: " + data.url);
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

export default function PrestamosActivosPage() {
  const { loans, deleteLoan, getLoans, addLoan } = useContext(LoansContext);
  const { setCurrentClient, getClients } = useContext(ClientsContext);
  const { user } = useContext(AuthContext);

  const [showModalLoan, setShowModalLoan] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showLoanDetail, setShowLoanDetail] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  // Estados para modales
  const [showBuscarCliente, setShowBuscarCliente] = useState(false);
  const [showNuevoPrestamo, setShowNuevoPrestamo] = useState(false);
  const [showAgregarCliente, setShowAgregarCliente] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // sortField se mantiene vacío, ya que el ordenamiento por "orden" se aplica únicamente al filtrar por ruta
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [paginatedLoans, setPaginatedLoans] = useState([]);

  const [totalLoanAmount, setTotalLoanAmount] = useState(0);
  const [totalPendiente, setTotalPendiente] = useState(0);
  const [clientsWithLoan, setClientsWithLoan] = useState(0);

  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");

  // Habilitar drag & drop solo si se filtra por ruta
  const isDraggable = selectedRoute !== "";

  // Notificaciones al habilitar/deshabilitar drag & drop
  useEffect(() => {
    if (isDraggable) {
      toast.info("Función de reordenar habilitada");
    } else {
      toast.info("Función de reordenar deshabilitada");
    }
  }, [isDraggable]);

  useEffect(() => {
    getLoans(false);
  }, [getLoans]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/routes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch((err) => console.error(err));
  }, []);

  // Función para obtener el nombre de la ruta
  const getRouteName = (rutaId) => {
    const route = routes.find((r) => r._id === rutaId);
    return route ? route.nombre : "Sin ruta";
  };

  // Actualización de la lista filtrada y paginada
  useEffect(() => {
    let filtered = [...loans];
    if (searchText.trim() !== "") {
      const lower = searchText.toLowerCase();
      filtered = filtered.filter(
        (loan) =>
          (loan.clientId?.name && loan.clientId.name.toLowerCase().includes(lower)) ||
          (loan.clientId?.contact && loan.clientId.contact.toLowerCase().includes(lower)) ||
          (loan.clientId?.document && loan.clientId.document.toLowerCase().includes(lower))
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((loan) => getLoanStatus(loan) === statusFilter);
    }
    if (selectedRoute) {
      filtered = filtered.filter((loan) => {
        if (!loan.ruta) return false;
        if (typeof loan.ruta === "object") {
          return loan.ruta._id === selectedRoute;
        }
        return loan.ruta === selectedRoute;
      });
      // Ordenar por el atributo "orden" cuando se filtra por ruta (de menor a mayor)
      filtered = filtered.sort((a, b) => a.orden - b.orden);
    } else if (sortField && sortField !== "ruta") {
      filtered = sortLoans(filtered, sortField, sortOrder);
    }
    const totalAmount = filtered.reduce((sum, loan) => sum + Number(loan.loanAmount), 0);
    const totalSaldo = filtered.reduce((sum, loan) => sum + Number(loan.balance), 0);
    const distinctClients = new Set(filtered.map((loan) => loan.clientId?._id));
    setTotalLoanAmount(totalAmount);
    setTotalPendiente(totalSaldo);
    setClientsWithLoan(distinctClients.size);
    const startIndex = (currentPage - 1) * itemsPerPage;
    setPaginatedLoans(filtered.slice(startIndex, startIndex + itemsPerPage));
  }, [loans, searchText, statusFilter, sortField, sortOrder, currentPage, itemsPerPage, selectedRoute]);

  const totalPages = Math.ceil(
    loans.filter((loan) => {
      if (searchText.trim() !== "") {
        const lower = searchText.toLowerCase();
        return (
          (loan.clientId?.name && loan.clientId.name.toLowerCase().includes(lower)) ||
          (loan.clientId?.contact && loan.clientId.contact.toLowerCase().includes(lower)) ||
          (loan.clientId?.document && loan.clientId.document.toLowerCase().includes(lower))
        );
      }
      return true;
    }).length / itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  function handlePayment(loan, e) {
    e.stopPropagation();
    setCurrentClient({
      ...loan.clientId,
      loanId: loan._id,
      installmentValue: loan.installmentValue,
      balance: loan.balance,
    });
    setShowPayment(true);
  }

  const openLoanDetail = (loan) => {
    setSelectedLoan(loan);
    setShowLoanDetail(true);
  };

  function editLoan(loan, e) {
    e.stopPropagation();
    setSelectedClient(loan.clientId._id);
    setSelectedLoan(loan);
    setShowModalLoan(true);
  }

  // Función para manejar el drag & drop (solo cuando esté habilitado)
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = paginatedLoans.findIndex((loan) => loan._id === active.id);
    const newIndex = paginatedLoans.findIndex((loan) => loan._id === over.id);
    const newLoans = arrayMove(paginatedLoans, oldIndex, newIndex);
    setPaginatedLoans(newLoans);
    toast.success("Orden modificado localmente");

    // Construir el arreglo para enviar al backend
    const loanOrder = newLoans.map((loan, index) => ({
      id: loan._id,
      orden: index
    }));
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/loans/reorder`, { loanOrder }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      toast.success("Orden actualizado en el servidor");
    } catch (error) {
      console.error("Error actualizando el orden en el servidor:", error);
      toast.error("Error al actualizar el orden en el servidor");
    }
  };

  return (
    <div id="exportContainer" className="p-4">
      {/* Encabezado y botones */}
      <div className="mb-4 flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <div className="flex items-center">
          <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white">Préstamos Activos</h2>
          <span className="ml-4 text-xl md:text-2xl text-primary font-bold">{loans.length}</span>
        </div>
        <div className="flex gap-4">
          <button onClick={exportToPDF} className="flex items-center text-sm md:text-base text-black dark:text-white hover:text-primary transition-colors">
            <FontAwesomeIcon icon={faDownload} className="mr-1" />
            Descargar
          </button>
          <button onClick={sendViaWhatsApp} className="flex items-center text-sm md:text-base text-black dark:text-white hover:text-primary transition-colors">
            <FontAwesomeIcon icon={faWhatsapp} className="mr-1" />
            Enviar
          </button>
        </div>
      </div>

      {/* Botón Agregar */}
      <div className="mb-4 flex justify-center md:justify-start">
        <Button variant="primary" onClick={() => setShowBuscarCliente(true)}>
          Agregar
        </Button>
      </div>

      {/* Totales y selección de ruta */}
      <div className="mb-8 flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center">
          <div className="text-md text-black dark:text-white">
            <span className="font-bold">Total Préstamos: </span>
            <span className="border-b-2 border-primary">$ {formatearNumero(totalLoanAmount)} /</span>
          </div>
          <div className="text-md text-black dark:text-white">
            <span className="font-bold">Cartera Pendiente: </span>
            <span className="border-b-2 border-primary">$ {formatearNumero(totalPendiente)} /</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-black dark:text-white">Ruta:</label>
          <select
            value={selectedRoute}
            onChange={(e) => {
              setSelectedRoute(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todas</option>
            {routes.map((ruta) => (
              <option key={ruta._id} value={ruta._id}>
                {ruta.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros y buscador */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button className={`text-sm md:text-base text-black dark:text-white hover:text-primary transition-colors ${statusFilter === "" ? "text-primary font-bold" : ""}`} onClick={() => setStatusFilter("")}>
            Todos
          </button>
          <button className={`text-sm md:text-base text-black dark:text-white hover:text-primary transition-colors ${statusFilter === "alDia" ? "text-primary font-bold" : ""}`} onClick={() => setStatusFilter("alDia")}>
            Al día
          </button>
          <button className={`text-sm md:text-base text-black dark:text-white hover:text-primary transition-colors ${statusFilter === "proximo" ? "text-primary font-bold" : ""}`} onClick={() => setStatusFilter("proximo")}>
            Próximo a vencer
          </button>
          <button className={`text-sm md:text-base text-black dark:text-white hover:text-primary transition-colors ${statusFilter === "enMora" ? "text-primary font-bold" : ""}`} onClick={() => setStatusFilter("enMora")}>
            En mora
          </button>
        </div>
        <div className="max-w-sm w-full relative">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary"
          />
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Vista móvil */}
      <div className="block md:hidden">
        {paginatedLoans.length > 0 ? (
          paginatedLoans.map((loan) => (
            <div
              key={loan._id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 cursor-pointer"
              onClick={() => openLoanDetail(loan)}
            >
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold text-black dark:text-white">
                  {capitalizarNombre(loan.clientId?.name)}
                </div>
                <Button variant="primary" className="!px-4 !py-2 !text-sm rounded-full" onClick={(e) => handlePayment(loan, e)}>
                  <FontAwesomeIcon icon={faDollarSign} />
                </Button>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{loan.description}</div>
              <div className="mt-2">
                {loan.latestPayment ? (
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {formatearNumero(loan.latestPayment.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatearFecha(loan.latestPayment.date)}{" "}
                      {new Date(loan.latestPayment.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">N/A</div>
                )}
              </div>
              <div className="mt-2 text-lg text-black dark:text-white">
                Saldo: {formatearNumero(loan.balance)}
              </div>
              <div className="mt-2 text-lg text-black dark:text-white">
                Cuotas: {getLoanProgress(loan).cuotasPagadas}/{getLoanProgress(loan).totalCuotas} ($
                {formatearNumero(getLoanProgress(loan).cuotaValor)})
              </div>
              <div className="mt-2 text-lg text-black dark:text-white">
                Ruta: {getRouteName(loan.ruta)}
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-4 relative">
                  <div
                    className="absolute left-0 top-0 h-4 rounded-full transition-all"
                    style={{
                      width: `${Math.min(Math.max(getLoanProgress(loan).progress, 0), 100)}%`,
                      background:
                        getLoanProgress(loan).progress < 50
                          ? "#EF4444"
                          : getLoanProgress(loan).progress < 80
                          ? "#F59E0B"
                          : getLoanProgress(loan).progress < 100
                          ? "#FBBF24"
                          : "#2BD6B1",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-4">No hay préstamos para mostrar.</div>
        )}
      </div>

      {/* Vista de escritorio */}
      <div className="hidden md:block" id="loansTable">
        {isDraggable ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={paginatedLoans.map((loan) => loan._id)} strategy={verticalListSortingStrategy}>
              <table className="min-w-full text-start font-light text-surface dark:text-white">
                <thead className="bg-primary font-medium text-white">
                  <tr>
                    <th className="px-4 py-2 text-lg font-bold text-left">Acción</th>
                    <th className="px-4 py-2 text-lg font-bold text-left cursor-pointer" onClick={() => handleSort("cliente")}>
                      Cliente
                    </th>
                    <th className="px-4 py-2 text-lg font-bold text-left">Último Pago</th>
                    <th className="px-4 py-2 text-lg font-bold text-left cursor-pointer" onClick={() => handleSort("saldo")}>
                      Saldo
                    </th>
                    <th className="px-4 py-2 text-lg font-bold text-left cursor-pointer" onClick={() => handleSort("cuotas")}>
                      Cuotas
                    </th>
                    <th className="px-4 py-2 text-lg font-bold text-left">Ruta</th>
                    <th className="px-4 py-2 text-lg font-bold text-left">Progreso</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLoans.length > 0 ? (
                    paginatedLoans.map((loan) => {
                      const { _id, clientId, description, balance } = loan;
                      const { cuotasPagadas, totalCuotas, progress } = getLoanProgress(loan);
                      return (
                        <SortableRow key={_id} id={_id}>
                          <td className="px-4 py-2">
                            <Button variant="primary" className="!px-4 !py-2 !text-sm rounded-full" onClick={(e) => handlePayment(loan, e)}>
                              <FontAwesomeIcon icon={faDollarSign} />
                            </Button>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-lg font-bold text-black dark:text-white">{capitalizarNombre(clientId?.name)}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">{description}</div>
                          </td>
                          <td className="px-4 py-2">
                            {loan.latestPayment ? (
                              <div>
                                <div className="text-lg font-bold text-primary">
                                  {formatearNumero(loan.latestPayment.amount)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatearFecha(loan.latestPayment.date)}{" "}
                                  {new Date(loan.latestPayment.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">N/A</div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-lg text-black dark:text-white">{formatearNumero(balance)}</td>
                          <td className="px-4 py-2 text-lg text-black dark:text-white">
                            {`${cuotasPagadas}/${totalCuotas} ($${formatearNumero(getLoanProgress(loan).cuotaValor)})`}
                          </td>
                          <td className="px-4 py-2 text-lg text-black dark:text-white">{getRouteName(loan.ruta)}</td>
                          <td className="px-4 py-2">
                            <div className="w-32 bg-gray-200 rounded-full h-4 relative">
                              <div
                                className="absolute left-0 top-0 h-4 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(Math.max(progress, 0), 100)}%`,
                                  background:
                                    progress < 50 ? "#EF4444" : progress < 80 ? "#F59E0B" : progress < 100 ? "#FBBF24" : "#2BD6B1",
                                }}
                              ></div>
                            </div>
                          </td>
                        </SortableRow>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center">
                        No hay préstamos para mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        ) : (
          <table className="min-w-full text-start font-light text-surface dark:text-white" id="loansTable">
            <thead className="bg-primary font-medium text-white">
              <tr>
                <th className="px-4 py-2 text-lg font-bold text-left">Acción</th>
                <th className="px-4 py-2 text-lg font-bold text-left cursor-pointer" onClick={() => handleSort("cliente")}>
                  Cliente
                </th>
                <th className="px-4 py-2 text-lg font-bold text-left">Último Pago</th>
                <th className="px-4 py-2 text-lg font-bold text-left cursor-pointer" onClick={() => handleSort("saldo")}>
                  Saldo
                </th>
                <th className="px-4 py-2 text-lg font-bold text-left cursor-pointer" onClick={() => handleSort("cuotas")}>
                  Cuotas
                </th>
                <th className="px-4 py-2 text-lg font-bold text-left">Ruta</th>
                <th className="px-4 py-2 text-lg font-bold text-left">Progreso</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLoans.length > 0 ? (
                paginatedLoans.map((loan) => {
                  const { _id, clientId, description, balance } = loan;
                  const { cuotasPagadas, totalCuotas, progress } = getLoanProgress(loan);
                  return (
                    <tr key={_id} onClick={() => openLoanDetail(loan)} className="border-b border-neutral-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                      <td className="px-4 py-2">
                        <Button variant="primary" className="!px-4 !py-2 !text-sm rounded-full" onClick={(e) => handlePayment(loan, e)}>
                          <FontAwesomeIcon icon={faDollarSign} />
                        </Button>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-lg font-bold text-black dark:text-white">{capitalizarNombre(clientId?.name)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{description}</div>
                      </td>
                      <td className="px-4 py-2">
                        {loan.latestPayment ? (
                          <div>
                            <div className="text-lg font-bold text-primary">
                              {formatearNumero(loan.latestPayment.amount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatearFecha(loan.latestPayment.date)}{" "}
                              {new Date(loan.latestPayment.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">N/A</div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-lg text-black dark:text-white">{formatearNumero(balance)}</td>
                      <td className="px-4 py-2 text-lg text-black dark:text-white">
                        {`${cuotasPagadas}/${totalCuotas} ($${formatearNumero(getLoanProgress(loan).cuotaValor)})`}
                      </td>
                      <td className="px-4 py-2 text-lg text-black dark:text-white">{getRouteName(loan.ruta)}</td>
                      <td className="px-4 py-2">
                        <div className="w-32 bg-gray-200 rounded-full h-4 relative">
                          <div
                            className="absolute left-0 top-0 h-4 rounded-full transition-all"
                            style={{
                              width: `${Math.min(Math.max(progress, 0), 100)}%`,
                              background:
                                progress < 50 ? "#EF4444" : progress < 80 ? "#F59E0B" : progress < 100 ? "#FBBF24" : "#2BD6B1",
                            }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    No hay préstamos para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <Button variant="secondary" onClick={handlePreviousPage} disabled={currentPage === 1}>
          Anterior
        </Button>
        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          return (
            <Button key={page} variant={currentPage === page ? "primary" : "secondary"} onClick={() => setCurrentPage(page)}>
              {page}
            </Button>
          );
        })}
        <Button variant="secondary" onClick={handleNextPage} disabled={currentPage === totalPages}>
          Siguiente
        </Button>
      </div>

      {showLoanDetail && selectedLoan && (
        <ModalLoanDetail loan={selectedLoan} onClose={() => setShowLoanDetail(false)} />
      )}

      {showModalLoan && (
        <ModalLoan
          showLoan={showModalLoan}
          setShowLoan={setShowModalLoan}
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          prestamo={selectedLoan || {}}
          setPrestamo={setSelectedLoan}
        />
      )}

      {showPayment && (
        <ModalPayments showPayment={showPayment} setShowPayment={setShowPayment} />
      )}

      {showBuscarCliente && (
        <SeleccionarClienteModal
          show={showBuscarCliente}
          onClose={() => setShowBuscarCliente(false)}
          onClientSelected={(client) => {
            setSelectedClient(client);
            setShowNuevoPrestamo(true);
          }}
        />
      )}

      {showNuevoPrestamo && selectedClient && (
        <NuevoPrestamoModal
          show={showNuevoPrestamo}
          onClose={() => setShowNuevoPrestamo(false)}
          client={selectedClient}
          onSave={(newLoanData) => {
            const func = async () => {
              await addLoan(newLoanData);
              getClients();
            };
            func();
          }}
        />
      )}

      <ToastContainer />

      <style jsx global>{`
        .whitespace-nowrap {
          white-space: nowrap;
        }
        th {
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
          text-align: left !important;
          font-size: 0.875rem;
        }
        td {
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
          text-align: left !important;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
