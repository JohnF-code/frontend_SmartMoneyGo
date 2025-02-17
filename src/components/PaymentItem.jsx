"use client";
import { useState, useContext } from "react";
import { formatearFecha, formatearNumero } from "../helpers";
import { PaymentsContext } from "@component/contexts/PaymentsContext";
import PaymentModal from "./PaymentModal"; // Nuevo modal con datos

// Función para capitalizar “Nombre Apellido” => iníciales mayúsculas, resto minúsculas
function capitalizarNombre(str = "") {
  const words = str.trim().split(" ");
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// Calcular “mora” (ejemplo simple)
function calcularMora(payment) {
  // TODO: Ajusta tu lógica real
  // Ejemplo: si payment.mora < 0 => “adelantado” => customBlue
  // si = 0 => primary
  // si > 0 => blackberry
  // si > 0 y loan terminado => danger
  // Este “payment.mora” no existe en tu DB, deberías calcular en base a #cuotas, etc.
  // Aquí un dummy:
  return payment.mora || 0; // Supongamos que ‘mora’ viene de DB
}

// Calcular color de la mora
function getMoraColor(mora, isTerminated) {
  if (mora < 0) return "text-customBlue";
  if (mora === 0) return "text-primary";
  if (mora > 0 && isTerminated) return "text-danger"; // Mora con fin de préstamo
  return "text-blackberry"; // Mora normal
}

// Calcular “progreso” => 0..100
function calcularProgreso(payment) {
  // TODO: Ejemplo => asume “loanId.installments” es total de cuotas
  // “payment.cuotaNumber” => la # de cuota actual, etc.
  const totalCuotas = payment.loanId?.installments || 1;
  const cuotaActual = payment.cuotaNumber || 1;
  return Math.round((cuotaActual / totalCuotas) * 100);
}

// Lógica para la barra de color => degradé según el valor
function getProgresoColor(pct) {
  // Podrías mapear 0..100 => un gradiente
  // Ej: < 30 => amarillo, < 70 => naranja, >= 70 => danger
  if (pct >= 100) return "bg-primary"; // final
  if (pct >= 70) return "bg-danger";
  if (pct >= 30) return "bg-orange-400";
  return "bg-yellow-400";
}

export default function PaymentItem({ payment }) {
  const { deletePayment } = useContext(PaymentsContext);

  const [showModal, setShowModal] = useState(false);

  // Mora & color
  const moraValue = calcularMora(payment);
  const moraColor = getMoraColor(moraValue, payment.loanId?.terminated);

  // Saldo => asume “loanId.balance”
  const saldoValue = payment.loanId?.balance || 0;

  // Cuota => asume “payment.cuotaNumber”
  const cuotaActual = payment.cuotaNumber || 1;

  // Progreso
  const pct = calcularProgreso(payment);
  const barColor = getProgresoColor(pct);

  // Nombre capitalizado
  const nombreCliente = capitalizarNombre(payment.clientId?.name || "");

  // Fecha con hora y minutos (ej: “dd/mm/yyyy hh:mm”)
  // ajusta formatearFecha para incluir hora
  function formatearFechaYHora(dateStr) {
    // EJEMPLO
    const d = new Date(dateStr);
    const options = { 
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    };
    return d.toLocaleString("es-CO", options);
  }

  return (
    <>
      {/* Fila principal */}
      <div
        className="flex hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        {/* Cantidad => 13 caracteres */}
        <div className="flex-1 max-w-[130px] py-2 px-2">
          <span className="font-bold text-emerald-600">$
            {formatearNumero(payment.amount)}
          </span>
        </div>

        {/* Nombre => 50 caracteres => en la demo no limitamos tanto, pero OK */}
        <div className="flex-1 max-w-[250px] py-2 px-2">
          {nombreCliente}
        </div>

        {/* Fecha => con hora y min => 150 px */}
        <div className="flex-1 max-w-[150px] py-2 px-2">
          {formatearFechaYHora(payment.date)}
        </div>

        {/* Mora => color dinámico */}
        <div className={`flex-1 max-w-[120px] py-2 px-2 font-bold ${moraColor}`}>
          {moraValue < 0
            ? `-${formatearNumero(Math.abs(moraValue))}`
            : formatearNumero(moraValue)
          }
        </div>

        {/* Saldo */}
        <div className="flex-1 max-w-[120px] py-2 px-2">
          ${formatearNumero(saldoValue)}
        </div>

        {/* Cuota */}
        <div className="flex-1 max-w-[100px] py-2 px-2">
          {cuotaActual}
        </div>

        {/* Progreso => barra horizontal */}
        <div className="flex-1 max-w-[140px] py-2 px-2">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-4 ${barColor} transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <PaymentModal
          payment={payment}
          onClose={() => setShowModal(false)}
          onDelete={() => deletePayment(payment._id)}
        />
      )}
    </>
  );
}
