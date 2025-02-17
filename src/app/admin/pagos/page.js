"use client";

import React, { useState, useEffect, useContext, useRef, Fragment } from "react";
import { createPortal } from "react-dom";

// Iconos
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faTimes,
  faTrashCan,
  faMagnifyingGlass,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

// Moment + moment-timezone
import moment from "moment-timezone";
moment.tz.setDefault("America/Bogota");
import "moment/locale/es";
moment.locale("es");

// Context / Helpers
import { PaymentsContext } from "@component/contexts/PaymentsContext";
import { formatearNumero, formatearFecha } from "@component/helpers";

// FullCalendar
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { DialogPanel, Transition, TransitionChild, Dialog, DialogTitle } from "@headlessui/react";

// ------------------------------------------------------------------
// (Si gustas, puedes mantener la lista, pero no la usaremos)
// const FESTIVOS_COLOMBIA = ["2025-01-20", "2025-03-24"];

// ------------------------------------------------------------------
// Funciones Auxiliares
// ------------------------------------------------------------------
function calcularMora(payment) {
  if (!payment.loanId) return { valor: 0, color: "primary" };

  const {
    date: fechaInicioPrestamo,
    finishDate,
    installmentValue,
    installments,
    balance,
    terminated,
  } = payment.loanId;

  if (!fechaInicioPrestamo || !installmentValue) {
    return { valor: 0, color: "primary" };
  }

  // Si el saldo está en 0 => la mora es 0 (Al día)
  if (balance <= 0) {
    return { valor: 0, color: "green-700" }; // color 'green-700' para "Al día"
  }

  const fechaPago = moment(payment.date);
  const totalPrestamo = installments * installmentValue;
  const totalPagado = totalPrestamo - balance;

  // Días hábiles hasta la fecha del pago
  const fechaInicio = moment(fechaInicioPrestamo);
  let diasHabiles = 0;
  const temp = fechaInicio.clone();

  while (temp.isSameOrBefore(fechaPago, "day")) {
    const day = temp.isoWeekday();
    if (day <= 6) diasHabiles++;
    temp.add(1, "day");
  }

  const cuotasAcumuladas = diasHabiles * installmentValue;
  let saldoEnMora = cuotasAcumuladas - totalPagado;

  if (saldoEnMora > 0) {
    const finalizadoPorFecha = finishDate
      ? fechaPago.isAfter(moment(finishDate))
      : false;
    if (finalizadoPorFecha || terminated) {
      saldoEnMora = Math.min(saldoEnMora, balance);
      if (finalizadoPorFecha) {
        return { valor: saldoEnMora, color: "danger" }; // rojo
      }
    }
    return { valor: saldoEnMora, color: "blackberry" }; // morado
  }

  if (saldoEnMora < 0) {
    return { valor: saldoEnMora, color: "customBlue" }; // azul
  }

  return { valor: 0, color: "primary" };
}

function calcularSaldoYCuotaFecha(payment, allPayments) {
  if (!payment.loanId) {
    return { saldo: 0, cuotaNum: 0, totalCuotas: 0, progreso: 0 };
  }
  const { installments, installmentValue, _id } = payment.loanId;
  const totalPrestamo = installments * installmentValue;

  const totalPagadoHastaFecha = allPayments
    .filter(
      (p) =>
        p.loanId &&
        p.loanId._id === _id &&
        moment(p.date).isSameOrBefore(moment(payment.date), "day")
    )
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const saldo = totalPrestamo - totalPagadoHastaFecha;
  const cuotaNum = parseInt(totalPagadoHastaFecha / installmentValue);
  const totalCuotas = installments;
  const progreso = (totalPagadoHastaFecha / totalPrestamo) * 100;

  return { saldo, cuotaNum, totalCuotas, progreso };
}

// ------------------------------------------------------------------
// PagosPage
// ------------------------------------------------------------------
export default function PagosPage() {
  const { payments, getPayments, deletePayment } = useContext(PaymentsContext);

  // --- FILTROS ---
  const [searchText, setSearchText] = useState("");
  const [filterSelected, setFilterSelected] = useState("hoy");
  const [dateInput, setDateInput] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Filtrado por color de mora
  const [colorFilter, setColorFilter] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const timerRef = useRef(null);

  // Lista filtrada
  const [filtrados, setFiltrados] = useState([]);
  // Totales
  const [totalPagos, setTotalPagos] = useState(0);
  const [totalMora, setTotalMora] = useState(0);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;
  const [pageBlock, setPageBlock] = useState(0);

  // Modales
  const [showModalDatos, setShowModalDatos] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  useEffect(() => {
    getPayments();
  }, [getPayments]);

  useEffect(() => {
    recalcularFiltro();
  }, [filterSelected, selectedDate, searchText, colorFilter, payments]);

  // ------------------------------------------------------------------
  // HANDLERS DE FILTRO
  // ------------------------------------------------------------------
  const handleSelectFilter = (filtro) => {
    setFilterSelected(filtro);
    setDateInput("");
    setSelectedDate("");
    setCurrentPage(1);
    setPageBlock(0);
  };

  // Manejo de color
  const handleClickColor = (color) => {
    // Si ya teníamos un timer, lo limpiamos
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Si haces clic en un color ya seleccionado, se desactiva
    if (colorFilter === color) {
      setColorFilter("");
      setSelectedColor(null);
      return;
    }

    // Caso contrario, activamos el color
    setColorFilter(color);
    setSelectedColor(color);

    // Temporizador de 3 minutos
    timerRef.current = setTimeout(() => {
      setColorFilter("");
      setSelectedColor(null);
      timerRef.current = null;
    }, 180000);
  };

  // ------------------------------------------------------------------
  // recalcularFiltro
  // ------------------------------------------------------------------
  const recalcularFiltro = () => {
    if (!payments) return;
    let tmp = [...payments];

    // 1) Filtro texto
    if (searchText.trim() !== "") {
      const texto = searchText.toLowerCase();
      tmp = tmp.filter((p) => {
        const name = p.clientId?.name?.toLowerCase() || "";
        const doc = p.clientId?.document || "";
        const phone = p.clientId?.contact || "";
        return (
          name.includes(texto) ||
          doc.includes(texto) ||
          phone.includes(texto)
        );
      });
    }

    // 2) Filtro Hoy, Semana, Mes, Año
    const now = moment();
    if (filterSelected === "hoy") {
      tmp = tmp.filter((p) => moment(p.date).isSame(now, "day"));
    } else if (filterSelected === "semana") {
      const startWeek = now.clone().startOf("week");
      if (startWeek.isoWeekday() !== 1) startWeek.isoWeekday(1);
      const endWeek = startWeek.clone().add(6, "days");
      tmp = tmp.filter((p) => {
        const d = moment(p.date);
        return d.isSameOrAfter(startWeek, "day") && d.isSameOrBefore(endWeek, "day");
      });
    } else if (filterSelected === "mes") {
      const startMonth = now.clone().startOf("month");
      const endMonth = now.clone().endOf("month");
      tmp = tmp.filter((p) => {
        const d = moment(p.date);
        return d.isSameOrAfter(startMonth, "day") && d.isSameOrBefore(endMonth, "day");
      });
    } else if (filterSelected === "año") {
      const startYear = now.clone().startOf("year");
      const endYear = now.clone().endOf("year");
      tmp = tmp.filter((p) => {
        const d = moment(p.date);
        return d.isSameOrAfter(startYear, "day") && d.isSameOrBefore(endYear, "day");
      });
    }

    // 3) Filtro fecha específica
    if (selectedDate) {
      const sel = moment(selectedDate).startOf("day");
      tmp = tmp.filter((p) => moment(p.date).isSame(sel, "day"));
    }

    // 4) Filtro por color
    if (colorFilter) {
      tmp = tmp.filter((p) => {
        const { color } = calcularMora(p);
        return color === colorFilter;
      });
    }

    // Guardamos la lista filtrada
    setFiltrados(tmp);

    // Calcular totales
    let sumPagos = 0;
    const lastPaymentByClient = {};

    tmp.forEach((pay) => {
      sumPagos += pay.amount || 0;
      const clientId = pay.clientId?._id || pay.clientId;
      if (!clientId) return;
      if (!lastPaymentByClient[clientId]) {
        lastPaymentByClient[clientId] = pay;
      } else {
        const fechaGuardada = lastPaymentByClient[clientId].date;
        if (moment(pay.date).isAfter(moment(fechaGuardada))) {
          lastPaymentByClient[clientId] = pay;
        }
      }
    });

    let sumMora = 0;
    Object.values(lastPaymentByClient).forEach((ultimoPago) => {
      const { valor } = calcularMora(ultimoPago);
      if (valor > 0) sumMora += valor;
    });

    setTotalPagos(sumPagos);
    setTotalMora(sumMora);
  };

  // ------------------------------------------------------------------
  // Manejo del campo Fecha con enmascarado (dd/mm/aaaa)
  // ------------------------------------------------------------------
  const handleDateMaskedInput = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);

    const d = val.slice(0, 2);
    const m = val.slice(2, 4);
    const y = val.slice(4, 8);

    let resultado = d;
    if (val.length >= 3) resultado += "/" + m;
    if (val.length >= 5) resultado += "/" + y;

    setDateInput(resultado);
  };

  useEffect(() => {
    if (dateInput.length === 10) {
      const [dd, mm, yyyy] = dateInput.split("/");
      const dateObj = moment(`${yyyy}-${mm}-${dd}`, "YYYY-MM-DD", true);
      if (dateObj.isValid()) {
        setSelectedDate(dateObj.toISOString());
        setFilterSelected("todos");
        setCurrentPage(1);
        setPageBlock(0);
      }
    } else {
      setSelectedDate("");
    }
  }, [dateInput]);

  const handleClearDate = () => {
    setDateInput("");
    setSelectedDate("");
  };

  // ------------------------------------------------------------------
  // Paginación
  // ------------------------------------------------------------------
  const totalPages = Math.ceil(filtrados.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filtrados.slice(indexOfFirstRow, indexOfLastRow);

  const goToPage = (num) => {
    setCurrentPage(num);
  };

  const blockSize = 5;
  const totalBlocks = Math.ceil(totalPages / blockSize);

  const startPage = blockSize * pageBlock + 1;
  let endPage = startPage + blockSize - 1;
  if (endPage > totalPages) endPage = totalPages;

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  const lastPage = totalPages;

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      if (currentPage - 1 < startPage && pageBlock > 0) {
        setPageBlock(pageBlock - 1);
      }
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      if (currentPage + 1 > endPage && pageBlock < totalBlocks - 1) {
        setPageBlock(pageBlock + 1);
      }
    }
  };
  const handlePrevBlock = () => {
    if (pageBlock > 0) {
      setPageBlock(pageBlock - 1);
      setCurrentPage(blockSize * (pageBlock - 1) + 1);
    }
  };
  const handleNextBlock = () => {
    if (pageBlock < totalBlocks - 1) {
      setPageBlock(pageBlock + 1);
      setCurrentPage(blockSize * (pageBlock + 1) + 1);
    }
  };

  // ------------------------------------------------------------------
  // Modal / Detalles
  // ------------------------------------------------------------------
  const verDetalles = (pago) => {
    setPagoSeleccionado(pago);
    setShowModalDatos(true);
  };
  const cerrarDetalles = () => {
    setShowModalDatos(false);
    setPagoSeleccionado(null);
  };

  const handleOpenCalendar = () => {
    setShowCalendarModal(true);
    setFilterSelected("todos");
    setCurrentPage(1);
    setPageBlock(0);
  };

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  return (
    <div className="p-0 space-y-4 w-full overflow-x-hidden">
      {/* Título */}
      <h2 className="text-2xl font-extrabold dark:text-white mb-4">
        Pagos Registrados{" "}
        <span className="text-primary text-2xl">{filtrados.length}</span>
      </h2>

      {/* Filtros / Pagos / Mora / Buscador */}
      <div className="flex flex-wrap justify-between items-center gap-3 w-full">
        {/* Filtros predefinidos (Hoy, Semana, etc.) */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleSelectFilter("hoy")}
            className={getButtonClasses(filterSelected, "hoy")}
          >
            Hoy
          </button>
          <button
            onClick={() => handleSelectFilter("semana")}
            className={getButtonClasses(filterSelected, "semana")}
          >
            S
          </button>
          <button
            onClick={() => handleSelectFilter("mes")}
            className={getButtonClasses(filterSelected, "mes")}
          >
            M
          </button>
          <button
            onClick={() => handleSelectFilter("año")}
            className={getButtonClasses(filterSelected, "año")}
          >
            A
          </button>
          <button
            onClick={() => handleSelectFilter("todos")}
            className={getButtonClasses(filterSelected, "todos")}
          >
            Todos
          </button>
        </div>

        {/* Pagos / Mora */}
        <div className="flex gap-6 items-center">
          <div className="text-md text-black dark:text-white">
            <span className="font-bold">Pagos </span>
            <span className="relative pb-[2px] border-b-2 border-primary">
              $ {formatearNumero(totalPagos)} /
            </span>
          </div>
          <div className="text-md text-black dark:text-white">
            <span className="font-bold">Mora </span>
            <span className="relative pb-[2px] border-b-2 border-primary">
              $ {formatearNumero(totalMora)} /
            </span>
          </div>
        </div>

        {/* Buscador / Fecha / Calendario */}
        <div className="flex items-center gap-2">
          {/* Buscador */}
          <div className="relative w-40 md:w-[300px]">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="(Nombre, Cédula...)"
              className="rounded-lg border border-gray-300 pl-10 pr-3 py-2 w-full dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary text-md"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Fecha */}
          <div className="relative w-20 md:w-[120px]">
            <input
              type="text"
              value={dateInput}
              onChange={handleDateMaskedInput}
              placeholder="dd/mm/aa"
              className="rounded-md border border-secondary text-md text-black dark:text-white text-center w-full focus:outline-none"
            />
            {dateInput && (
              <button
                onClick={handleClearDate}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-red-500 hover:scale-150 transition"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          {/* Calendario */}
          <button
            onClick={handleOpenCalendar}
            className="p-2 rounded-md transition duration-200 focus:outline-none text-black dark:text-white border border-gray-300 hover:bg-gray-200"
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
          </button>
        </div>
      </div>

      {/* Semáforo => con links clickeables */}
      <div className="hidden md:flex justify-end gap-6 mb-6">
        {/* MORADO => color: "blackberry" */}
        <div className="flex flex-col items-center">
          <div
            onClick={() => handleClickColor("blackberry")}
            className={`
              cursor-pointer w-4 h-4 rounded-full bg-blackberry transition-transform
              ${
                selectedColor === "blackberry"
                  ? "scale-150"
                  : "hover:scale-150"
              }
            `}
            title="Ver mora > 0 (normal)"
          />
          <span className="text-md dark:text-white">Mora &gt; 0</span>
        </div>

        {/* AZUL => color: "customBlue" */}
        <div className="flex flex-col items-center">
          <div
            onClick={() => handleClickColor("customBlue")}
            className={`
              cursor-pointer w-4 h-4 rounded-full bg-customBlue transition-transform
              ${
                selectedColor === "customBlue"
                  ? "scale-150"
                  : "hover:scale-150"
              }
            `}
            title="Mora < 0"
          />
          <span className="text-md dark:text-white">Mora &lt; 0</span>
        </div>

        {/* ROJO => color: "danger" */}
        <div className="flex flex-col items-center">
          <div
            onClick={() => handleClickColor("danger")}
            className={`
              cursor-pointer w-4 h-4 rounded-full bg-danger transition-transform
              ${selectedColor === "danger" ? "scale-150" : "hover:scale-150"}
            `}
            title="Mora y Vencido"
          />
          <span className="text-md dark:text-white">Mora y Vencido</span>
        </div>
      </div>

      {/* VISTA DESKTOP => Tabla */}
      <div className="hidden md:block w-full">
        <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-lg">
          <table className="min-w-full text-left font-light">
            <thead className="bg-primary text-white border-b border-neutral-200">
              <tr>
                <th className="px-4 py-2 text-md font-extrabold w-[120px]">
                  Cantidad
                </th>
                <th className="px-4 py-2 text-md font-extrabold w-[300px]">
                  Nombre
                </th>
                <th className="px-4 py-2 text-md font-extrabold w-[140px]">
                  Fecha
                </th>
                <th className="px-4 py-2 text-md font-extrabold w-[80px]">
                  Mora
                </th>
                <th className="px-4 py-2 text-md font-extrabold w-[80px]">
                  Saldo
                </th>
                <th className="px-4 py-2 text-md font-extrabold w-[70px]">
                  Cuota
                </th>
                <th className="px-4 py-2 text-md font-extrabold w-[120px]">
                  Progreso
                </th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No hay pagos para mostrar
                  </td>
                </tr>
              ) : (
                currentRows.map((pay) => {
                  // Calcular mora
                  const { valor: moraValor, color: moraColor } = calcularMora(
                    pay
                  );

                  // Calcular saldo y cuota a la fecha de ese pago
                  const {
                    saldo,
                    cuotaNum,
                    totalCuotas,
                    progreso,
                  } = calcularSaldoYCuotaFecha(pay, payments);

                  const hora12 = moment(pay.date).format("hh:mm A");

                  return (
                    <tr
                      key={pay._id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => verDetalles(pay)}
                    >
                      <td className="px-4 py-2 text-md font-medium text-primary dark:text-white">
                        $ {formatearNumero(pay.amount)}
                      </td>
                      <td className="px-4 py-2 text-md dark:text-white">
                        <div className="font-semibold">
                          {capitalizarNombre(pay?.clientId?.name || "S/N")}
                        </div>
                        <div className="text-md text-gray-900 dark:text-white">
                          {pay.loanId?.description || "Sin desc."}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-md dark:text-white">
                        <div className="font-bold">
                          {formatearFecha(pay.date, true, false)}
                        </div>
                        <div>{hora12}</div>
                      </td>
                      <td
                        className={`px-4 py-2 text-md font-semibold ${
                          moraValor === 0
                            ? "text-green-700"
                            : `text-${moraColor}`
                        }`}
                      >
                        {moraValor === 0
                          ? "Al día"
                          : moraValor > 0
                          ? `+${formatearNumero(moraValor)}`
                          : `${formatearNumero(moraValor)}`}
                      </td>
                      <td className="px-4 py-2 text-md dark:text-white">
                        {formatearNumero(saldo)}
                      </td>
                      <td className="px-4 py-2 text-md dark:text-white">
                        {cuotaNum} de {totalCuotas}
                      </td>
                      <td className="px-4 py-2">
                        <div className="w-24 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-4 transition-all"
                            style={{
                              width: `${Math.min(Math.max(progreso, 0), 100)}%`,
                              background:
                                progreso < 50
                                  ? "#EF4444"
                                  : progreso < 80
                                  ? "#F59E0B"
                                  : progreso < 100
                                  ? "#FBBF24"
                                  : "#2BD6B1",
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VISTA MÓVIL */}
      <div className="block md:hidden">
        {currentRows.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No hay pagos para mostrar
          </div>
        ) : (
          <MobilePaymentsList
            pagos={currentRows}
            onClickPago={verDetalles}
            allPayments={payments}
          />
        )}
      </div>

      {/* Paginación */}
      {filtrados.length > rowsPerPage && (
        <div className="flex flex-wrap justify-center items-center mt-4 gap-2">
          {/* BOTÓN Anterior */}
          <button
            onClick={handlePrevPage}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-secondary"
          >
            <span className="hidden md:inline">Anterior</span>
            <span className="md:hidden">Ant</span>
          </button>

          {pageBlock > 0 && (
            <button
              onClick={() => {
                setCurrentPage(1);
                setPageBlock(0);
              }}
              className={`px-3 py-1 border border-gray-300 rounded hover:bg-secondary ${
                currentPage === 1 ? "bg-primary text-white" : ""
              }`}
            >
              1
            </button>
          )}
          {pageBlock > 0 && (
            <button
              onClick={handlePrevBlock}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-secondary"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          )}

          {pages.map((num) => (
            <button
              key={num}
              onClick={() => goToPage(num)}
              className={`px-3 py-1 border border-gray-300 rounded hover:bg-secondary ${
                currentPage === num ? "bg-primary text-white" : ""
              }`}
            >
              {num}
            </button>
          ))}

          {endPage < totalPages && (
            <button
              onClick={handleNextBlock}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-secondary"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          )}
          {endPage < totalPages && (
            <button
              onClick={() => goToPage(lastPage)}
              className={`px-3 py-1 border border-gray-300 rounded hover:bg-secondary ${
                currentPage === lastPage ? "bg-primary text-white" : ""
              }`}
            >
              {lastPage}
            </button>
          )}

          {/* BOTÓN Siguiente */}
          <button
            onClick={handleNextPage}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-secondary"
          >
            <span className="hidden md:inline">Siguiente</span>
            <span className="md:hidden">Sig</span>
          </button>
        </div>
      )}

      {/* Modal Datos Préstamo */}
      {showModalDatos && pagoSeleccionado && (
        <ModalDatosPrestamo
          pago={pagoSeleccionado}
          showModalDatos={showModalDatos}
          setShowModalDatos={setShowModalDatos}
          deletePayment={deletePayment}
        />
      )}

      {/* Modal Calendario */}
      {showCalendarModal && (
        <ModalCalendarFull
          onClose={() => setShowCalendarModal(false)}
          selectedDate={selectedDate}
          onPickDate={(isoDate) => {
            setSelectedDate(isoDate);
            // Ajusta la fecha en tu input
            setDateInput(moment(isoDate).format("DD/MM/YYYY"));
            setFilterSelected("todos");
            setCurrentPage(1);
            setPageBlock(0);
            setShowCalendarModal(false);
          }}
        />
      )}

      {/* Estilos extras */}
      <style jsx global>{`
        .fc-daygrid-day-frame {
          border: none !important;
        }

        /* Centra el número de cada día */
        .fc-daygrid-day-top {
          justify-content: center !important;
        }
        .fc-daygrid-day-number {
          text-align: center !important;
        }

        /* Colores custom */
        .bg-blackberry {
          background-color: #6b21a8; /* Morado */
        }
        .bg-customBlue {
          background-color: #2563eb; /* Azul */
        }
        .bg-danger {
          background-color: #dc2626; /* Rojo */
        }
      `}</style>
    </div>
  );
}

// ------------------------------------------------------------------
// MobilePaymentsList
// ------------------------------------------------------------------
function MobilePaymentsList({ pagos, onClickPago, allPayments }) {
  return (
    <div className="space-y-4">
      {pagos.map((pay, index) => {
        const rowClass =
          index % 2 === 0
            ? "bg-gray-100 dark:bg-gray-700"
            : "bg-white dark:bg-gray-800";

        const { valor: moraValor, color: moraColor } = calcularMora(pay);
        const { saldo, cuotaNum, totalCuotas, progreso } =
          calcularSaldoYCuotaFecha(pay, allPayments);
        const hora12 = moment(pay.date).format("hh:mm A");

        return (
          <div
            key={pay._id}
            className={`p-3 rounded-md cursor-pointer ${rowClass}`}
            onClick={() => onClickPago(pay)}
          >
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden mb-2">
              <div
                className="absolute left-0 top-0 h-4 transition-all"
                style={{
                  width: `${Math.min(Math.max(progreso, 0), 100)}%`,
                  background:
                    progreso < 50
                      ? "#EF4444"
                      : progreso < 80
                      ? "#F59E0B"
                      : progreso < 100
                      ? "#FBBF24"
                      : "#2BD6B1",
                }}
              />
            </div>

            {/* Nombre + desc */}
            <div className="text-lg font-bold text-black dark:text-white">
              {capitalizarNombre(pay?.clientId?.name || "S/N")}
            </div>
            <div className="text-sm text-black dark:text-white mb-2">
              {pay.loanId?.description || "Sin desc."}
            </div>

            {/* Monto / fecha / hora */}
            <div className="flex flex-wrap gap-2 mb-2 text-sm text-black dark:text-white">
              <span className="font-semibold">${formatearNumero(pay.amount)}</span>
              <span>
                {formatearFecha(pay.date, true, false)} {hora12}
              </span>
            </div>

            {/* Mora / Saldo / Cuota */}
            <div className="flex flex-col">
              <div className="text-xs text-gray-700 dark:text-gray-300 mb-1 font-normal">
                Mora / Saldo / Cuota
              </div>
              <div className="text-sm font-semibold flex gap-4 text-black dark:text-white">
                <span
                  className={
                    moraValor === 0 ? "text-green-700" : `text-${moraColor}`
                  }
                >
                  {moraValor === 0
                    ? "Al día"
                    : moraValor > 0
                    ? `+${formatearNumero(moraValor)}`
                    : `${formatearNumero(moraValor)}`}
                </span>
                <span>{formatearNumero(saldo)}</span>
                <span>
                  {cuotaNum} / {totalCuotas}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------
// Modal “Datos Préstamo”
// ------------------------------------------------------------------
function ModalDatosPrestamo({ pago, showModalDatos, setShowModalDatos, deletePayment }) {
  
  const handleEliminar = () => {
    console.log('handle Eliminar Pago');
    deletePayment(pago._id);
    setShowModalDatos(false);
  };

  return (
    <Transition
      appear show={showModalDatos} as={Fragment}
    >
      <Dialog
        open={showModalDatos}
        transition
        className="fixed inset-0 flex w-screen items-center justify-center p-4 z-200"
        onClose={() => setShowModalDatos(false)}
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
      <DialogPanel
        className="relative z-10 bg-white rounded-lg shadow dark:bg-gray-700"
      >
      <div
        className="bg-white dark:bg-gray-700 rounded p-4 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Datos Prestamo
        </DialogTitle>

        <div className="space-y-2 text-black dark:text-white p-10">
          <p>
            <span className="inline-block w-[80px] font-semibold">Nombre:</span>{" "}
            {pago.clientId?.name || "--"}
          </p>
          <p>
            <span className="inline-block w-[80px] font-semibold">Cédula:</span>{" "}
            {pago.clientId?.document || "--"}
          </p>
          <p>
            <span className="inline-block w-[80px] font-semibold">Tel:</span>{" "}
            {pago.clientId?.contact || "--"}
          </p>
          <p>
            <span className="inline-block w-[80px] font-semibold">
              Préstamo:
            </span>{" "}
            {formatearNumero(pago.loanId?.loanAmount || 0)}
          </p>
          <p>
            <span className="inline-block w-[80px] font-semibold">
              Interés:
            </span>{" "}
            {pago.loanId?.interest ?? 0}%
          </p>
          <p>
            <span className="inline-block w-[80px] font-semibold">Inicio:</span>{" "}
            {formatearFecha(pago.clientId?.date)}
          </p>
          <p>
            <span className="inline-block w-[80px] font-semibold">Fin:</span>{" "}
            {formatearFecha(pago.loanId?.finishDate)}
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={handleEliminar}
            className="px-4 py-2 rounded-md bg-primary text-white flex items-center focus:outline-none"
          >
            <FontAwesomeIcon icon={faTrashCan} className="mr-2" /> Eliminar
          </button>
        </div>
      </div>
      </DialogPanel>
      
      </Dialog>
    </Transition>
  );
}

// ------------------------------------------------------------------
// ModalCalendarFull => FullCalendar con “estilos”
// ------------------------------------------------------------------
function ModalCalendarFull({ onClose, onPickDate, selectedDate }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center text-md justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-700 p-2 relative rounded w-[400px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-2xl text-primary hover:text-red-500"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          timeZone="America/Bogota"
          locale="es"
          headerToolbar={{
            start: "prev,next today",
            center: "title",
            end: "",
          }}
          // La fecha inicial del calendario
          initialDate={moment().format("YYYY-MM-DD")}

          // Al hacer clic en un día => se selecciona
          dateClick={(info) => {
            const iso = new Date(info.dateStr).toISOString();
            if (onPickDate) {
              onPickDate(iso);
            }
          }}

          // dayCellClassNames => personalizamos "hoy" y la fecha seleccionada
          dayCellClassNames={(arg) => {
            const dateStr = moment(arg.date).format("YYYY-MM-DD");
            const todayStr = moment().format("YYYY-MM-DD");
            const selectedStr = selectedDate
              ? moment(selectedDate).format("YYYY-MM-DD")
              : null;

            const classes = [];

            // Hoy => color primary (fondo + texto blanco)
            if (dateStr === todayStr) {
              classes.push("fc-day-today");
            }

            // Si es la fecha seleccionada => un circulo primary, texto blanco
            if (selectedStr && dateStr === selectedStr) {
              classes.push("fc-selected-day");
            }

            return classes;
          }}
        />
      </div>

      {/* Estilos “extra” para HOY y para el día seleccionado */}
      <style jsx global>{`
        /* Día de hoy => fondo primary, texto blanco */
        .fc-day-today {
          background-color: var(--color-primary) !important;
          color: #fff !important;
          border-radius: 50% !important;
        }
        /* Día seleccionado => circulo primary, texto blanco */
        .fc-selected-day {
          background-color: var(--color-primary) !important;
          color: #fff !important;
          border-radius: 50% !important;
          transition: all 0.2s ease;
        }
        /* Hover => cambia fondo leve */
        .fc-daygrid-day:hover {
          background-color:rgb(24, 210, 207) !important;
          cursor: pointer;
        }
        /* Centrar números en el modal también */
        .fc-daygrid-day-top {
          justify-content: center !important;
        }
        .fc-daygrid-day-number {
          text-align: center !important;
        }
      `}</style>
    </div>,
    document.body
  );
}

// ------------------------------------------------------------------
// Función para capitalizar el nombre
// ------------------------------------------------------------------
function capitalizarNombre(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

// ------------------------------------------------------------------
// Función para estilos de botón de filtros
// ------------------------------------------------------------------
function getButtonClasses(currentFilter, btnId) {
  const base =
    "px-4 py-2 rounded-md text-md transition duration-200 transform focus:outline-none";
  const scaleClass = currentFilter === btnId ? "scale-150" : "hover:scale-150";
  let colorText = "text-black dark:text-white";
  if (currentFilter === btnId) {
    colorText = "text-primary";
  }
  return `${base} ${scaleClass} ${colorText}`;
}
