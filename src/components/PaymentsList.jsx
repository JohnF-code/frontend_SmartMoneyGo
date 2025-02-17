"use client";

import { useState } from "react";
import ModalPaymentInfo from "@component/components/ModalPaymentInfo"; // si deseas un modal con info
import { formatearNumero } from "@component/helpers";

/**
 * Recibe:
 *  - payments = [...],
 *  - highlightPagos (boolean),
 *  - highlightMora (boolean)
 */
export default function PaymentsList({
  payments,
  highlightPagos = false,
  highlightMora = false,
}) {
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Al hacer click en un pago => mostrar modal
  function handleRowClick(payment) {
    setSelectedPayment(payment);
  }

  // Cerrar modal
  function closeModal() {
    setSelectedPayment(null);
  }

  // Calcula el "progreso" => 0..1
  // por ejemplo = (#cuotasPagadas / #cuotasTotales)
  // asume que el Payment trae "cuotaActual" y "totalCuotas" => adaptalo
  function getProgreso(payment) {
    // EJEMPLO:
    if (!payment?.loanId?.installments) return 0;
    if (!payment?.cuotaActual) return 0;
    // e.g. cuotaActual / installments
    const val =
      payment.cuotaActual / payment.loanId.installments;
    return Math.min(Math.max(val, 0), 1);
  }

  return (
    <div className="w-full mt-4 overflow-x-auto">
      {/* Encabezados => 1 fila con 7 "barras" (Cant, Nombre, Fecha, Mora, Saldo, Cuota, Progreso) */}
      <div className="flex flex-row bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-bold">
        <div style={{ width: "13ch" }} className="px-2 py-2">
          Cantidad
        </div>
        <div style={{ width: "50ch" }} className="px-2 py-2">
          Nombre
        </div>
        <div style={{ minWidth: "12ch" }} className="px-2 py-2">
          Fecha
        </div>
        <div style={{ minWidth: "8ch" }} className="px-2 py-2">
          Mora
        </div>
        <div style={{ minWidth: "8ch" }} className="px-2 py-2">
          Saldo
        </div>
        <div style={{ minWidth: "8ch" }} className="px-2 py-2">
          Cuota
        </div>
        <div style={{ minWidth: "10ch" }} className="px-2 py-2">
          Progreso
        </div>
      </div>

      {payments.map((payment, idx) => {
        // Determinar color Mora => 0 => primary, >0 => blackberry, <0 => customBlue, etc.
        let moraColor = "text-primary"; // = 0
        if (payment.mora > 0) {
          moraColor = "text-blackberry";
        } else if (payment.mora < 0) {
          moraColor = "text-customBlue";
        }
        // si está vencido + mora => "text-danger" => adaptalo
        if (payment?.vencido && payment.mora > 0) {
          moraColor = "text-danger";
        }

        // "resaltar" la columna de "cantidad" si highlightPagos = true
        const pagosColumnClass = highlightPagos
          ? "bg-secondary text-black"
          : "";
        // "resaltar" la columna de "mora" si highlightMora = true
        const moraColumnClass = highlightMora
          ? "bg-secondary text-black"
          : "";

        // Nombre formateado => mayúscula inicial
        const rawName = payment?.clientId?.name || "Sin Nombre";
        const nameFormatted = rawName
          .split(" ")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(" ");
        // Descripción => la pones debajo de nombre
        const desc = payment?.loanId?.description || "";

        // Fecha con hora-min
        const pDate = new Date(payment.date);
        const hh = pDate.getHours().toString().padStart(2, "0");
        const mm = pDate.getMinutes().toString().padStart(2, "0");
        const fechaStr = `${pDate.toLocaleDateString("es-CO")} ${hh}:${mm}`;

        // Saldo => Payment no se recalcula => supongo "payment.saldoAtPayment"? adaptarlo
        const saldo = payment?.saldoAlMomento || 0;

        // Cuota => "payment.cuotaActual"? adaptarlo
        const cuotaActual = payment?.cuotaActual || 1;

        // Progreso => barra horizontal
        const progress = getProgreso(payment); // 0..1

        return (
          <div
            key={payment._id || idx}
            className="
              flex flex-row border-b border-gray-300 dark:border-gray-600
              hover:bg-gray-100 dark:hover:bg-gray-800
              cursor-pointer
            "
            onClick={() => handleRowClick(payment)}
          >
            {/* Cantidad => 13ch */}
            <div
              style={{ width: "13ch" }}
              className={`px-2 py-2 ${pagosColumnClass}`}
            >
              <span className="font-bold text-emerald-600 mr-1">$</span>
              {formatearNumero(payment.amount || 0)}
            </div>

            {/* Nombre => 50ch (con descripción debajo en el mismo renglón) */}
            <div style={{ width: "50ch" }} className="px-2 py-2">
              <span className="font-semibold">{nameFormatted}</span>
              {desc ? (
                <span className="ml-2 text-sm italic text-gray-500 dark:text-gray-400">
                  ({desc})
                </span>
              ) : null}
            </div>

            {/* Fecha => 12ch */}
            <div style={{ minWidth: "12ch" }} className="px-2 py-2">
              {fechaStr}
            </div>

            {/* Mora => 8ch */}
            <div style={{ minWidth: "8ch" }} className={`px-2 py-2 ${moraColumnClass}`}>
              <span className={`${moraColor} font-bold`}>
                {payment.mora === 0
                  ? "0"
                  : formatearNumero(payment.mora)}
              </span>
            </div>

            {/* Saldo => 8ch */}
            <div style={{ minWidth: "8ch" }} className="px-2 py-2">
              {formatearNumero(saldo)}
            </div>

            {/* Cuota => 8ch */}
            <div style={{ minWidth: "8ch" }} className="px-2 py-2">
              {cuotaActual}
            </div>

            {/* Progreso => 10ch => barra horizontal */}
            <div style={{ minWidth: "10ch" }} className="px-2 py-2">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 relative overflow-hidden">
                {/* Barra interna animada */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-600 transition-all"
                  style={{
                    width: `${progress * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal con información del payment */}
      {selectedPayment && (
        <ModalPaymentInfo payment={selectedPayment} onClose={closeModal} />
      )}
    </div>
  );
}
