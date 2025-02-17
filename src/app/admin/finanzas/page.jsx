"use client"; // Indica que este archivo es un componente cliente en un entorno de renderizado híbrido (como Next.js).

import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@component/contexts/AuthContext"; // Contexto de autenticación.
import { PaymentsContext } from "@component/contexts/PaymentsContext"; // Contexto de pagos.
import Button from "@component/components/Button";

// Modales
import ModalCapital from "@component/components/modalCapital";
import ModalBill from "@component/components/modalBill";
import ModalWidthdrawal from "@component/components/modalWidthdrawal";
import ModalTomorrow from "@component/components/modalTomorrow";
import ModalPendingPayments from "@component/components/modalPendingPayments";
import TodayPaymentsModal from "@component/components/todayPaymentsModal";
import TodayClientsModal from "@component/components/todayClientsModal";
import YesterdayLoansModal from "@component/components/yesterdayLoansModal";
import TodayLoansModal from "@component/components/todayLoansModal";

// Varios
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Estadísticas y gráficas
import Statistics from "@component/components/statics";
import GraficaDePagos from "@component/components/GraficaDePagos";

// Configuración de Axios
import axios from "@component/config/axios";

// Importar la librería de socket.io-client para manejar la comunicación en tiempo real
import { io } from "socket.io-client";

function Preloader() {
  return (
    <div className="flex items-center justify-center py-10">
  <div className="relative w-16 h-16">
    <div className="absolute rounded-full bg-primary opacity-75 animate-ping w-full h-full"></div>
    <div className="absolute rounded-full bg-primary w-12 h-12 m-auto"></div>
  </div>
</div>

  );
}

export default function Finanzas() {
  const { user } = useContext(AuthContext);
  const { getPayments, getCapital, capital, payments } = useContext(PaymentsContext);

  const [showModalCapital, setShowModalCapital] = useState(false);
  const [showModalBill, setShowModalBill] = useState(false);
  const [showModalWidthdraw, setShowModalWidthdraw] = useState(false);
  const [showModalTomorrow, setShowModalTomorrow] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [showTodayModal, setShowTodayModal] = useState(false);
  const [showTodayClientsModal, setShowTodayClientsModal] = useState(false);
  const [showYesterdayLoansModal, setShowYesterdayLoansModal] = useState(false);
  const [showTodayLoansModal, setShowTodayLoansModal] = useState(false);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Conexión al servidor Socket.IO
    const socket = io("http://localhost:5000"); // Ajusta la URL al backend si es necesario.

    // Evento cuando se conecta a Socket.IO
    socket.on("connect", () => {
      console.log("Conectado al servidor Socket.IO");
    });

    // Escuchar evento de actualización de pago
    socket.on("paymentUpdated", (data) => {
      console.log("Pago actualizado:", data);
      // Aquí puedes actualizar el estado de los datos en frontend
      // o llamar a funciones como getPayments() para obtener datos frescos
    });

    // Desconectar el socket cuando el componente se desmonte
    return () => {
      socket.disconnect();
    };
  }, []); // Este effect solo se ejecuta una vez cuando el componente se monta

  useEffect(() => {
    async function fetchSummaryData() {
      try {
        setError(null);

        const token = window.localStorage.getItem("token");
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };

        const resp = await axios.get("/summary", config);
        setSummary(resp.data);

        await getPayments();
        await getCapital();

        setLoading(false);
      } catch (err) {
        setError(err);
        console.error("Error al obtener el resumen:", err);
        setLoading(false);
      }
    }

    fetchSummaryData();
  }, [getPayments, getCapital]);

  const {
    pendingPaymentsToday = 0,
    pendingPaymentsTomorrow = 0,
    totalPaymentsToday = 0,
    todayPaymentsCount = 0,
    createdClientsTodayCount = 0,
    createdLoansTodayCount = 0,
    createdLoansYesterdayCount = 0,
    saldoCaja = 0,
    monthRecaudado = 0,
    monthLoansCreated = 0,
    monthImpagos = 0,
    monthPagosRegistrados = 0,
    pagosPorMes = [],
    impagos = [],
    pendingPaymentsTodayDetails = [],
    pendingPaymentsTomorrowDetails = [],
    paymentsTodayDetails = [],
    clientsTodayList = [],
    loansYesterdayList = [],
    loansTodayList = [],
  } = summary || {};

  return (
    <>
      {loading ? (
        <div className="container max-w-[95%] mx-auto">
          <h2 className="mb-8 text-3xl font-extrabold text-black dark:text-white">
            Finanzas
          </h2>
          <Preloader />
        </div>
      ) : (
        <div className="container max-w-[95%] sm:max-w-full mx-auto">
          <h2 className="mb-8 text-3xl font-extrabold text-black dark:text-white">
            Finanzas
          </h2>

          {error && (
            <div
              className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
              role="alert"
            >
              <span className="font-medium">Error:</span>{" "}
              {error.message || "Ocurrió un problema al cargar los datos."}
            </div>
          )}

          {(user?.role === "administrador" || user?.role === "finanzas") && (
            <Statistics capital={capital} payments={payments} />
          )}

          {user?.role === "administrador" && (
            <div className="flex mb-8 gap-2">
              <Button variant="primary" onClick={() => setShowModalCapital(true)}>
                Añadir Capital
              </Button>
              <Button variant="primary" onClick={() => setShowModalBill(true)}>
                Añadir Gastos
              </Button>
              <Button variant="primary" onClick={() => setShowModalWidthdraw(true)}>
                Añadir Retiro
              </Button>
            </div>
          )}

          <main className="flex flex-col lg:flex-row gap-x-5 mx-auto">
            <div className="flex flex-col mb-6">
              <div className="p-4 mb-2 bg-white dark:bg-slate-900 rounded-2xl">
                <h4 className="text-lg font-bold text-black dark:text-white border-b-2 border-slate-300 mb-4">
                  Resumen de Hoy
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="p-2 rounded-md text-start hover:bg-primary dark:hover:bg-primary"
                    onClick={() => setShowPending(true)}
                  >
                    <span className="text-sm text-slate-500 dark:text-slate-200">
                      Pagos pendientes hoy
                    </span>
                    <p className="text-lg font-bold text-black dark:text-white">
                      ${pendingPaymentsToday.toLocaleString()}
                    </p>
                  </button>

                  <button
                    className="p-2 rounded-md text-start hover:bg-primary dark:hover:bg-primary"
                    onClick={() => setShowModalTomorrow(true)}
                  >
                    <span className="text-sm text-slate-500 dark:text-slate-300">
                      Pagos pendientes mañana
                    </span>
                    <p className="text-lg font-bold text-black dark:text-white">
                      ${pendingPaymentsTomorrow.toLocaleString()}
                    </p>
                  </button>

                  <button
                    className="p-2 rounded-md text-start hover:bg-primary dark:hover:bg-primary"
                    onClick={() => setShowTodayModal(true)}
                  >
                    <span className="text-sm text-slate-500 dark:text-white">
                      Recaudo hoy
                    </span>
                    <p className="text-lg font-bold text-black dark:text-white">
                      ${totalPaymentsToday.toLocaleString()}
                    </p>
                  </button>

                  <div className="p-2 rounded-md text-start hover:bg-primary dark:hover:bg-blue-primary">
                    <span className="text-sm text-slate-500 dark:text-white">
                      Saldo Caja
                    </span>
                    <p className="text-lg font-bold text-black dark:text-white">
                      ${saldoCaja.toLocaleString()}
                    </p>
                  </div>

                  <div className="p-2">
                    <span className="text-sm text-slate-500 dark:text-white">
                      Pagos hoy
                    </span>
                    <p className="text-lg font-bold text-black dark:text-white">
                      {todayPaymentsCount}
                    </p>
                  </div>

                  <div
                    className="p-2 rounded-md text-start hover:bg-primary dark:hover:bg-primary cursor-pointer"
                    onClick={() => setShowTodayClientsModal(true)}
                  >
                    <span className="text-sm text-slate-500 dark:text-white">
                      Clientes hoy
                    </span>
                    <p className="text-lg font-bold text-black dark:text-white">
                      {createdClientsTodayCount}
                    </p>
                  </div>

                  <div
                    className="p-2 rounded-md text-start hover:bg-primary dark:hover:bg-primary cursor-pointer"
                    onClick={() => setShowTodayLoansModal(true)}
                  >
                    <span className="text-sm text-slate-500 dark:text-white">
                      Préstamos hoy
                    </span>
                    <p className="text-lg font-bold text-black dark:text-white">
                      {createdLoansTodayCount}
                    </p>
                  </div>

                  <div
                    className="p-2 rounded-md text-start hover:bg-primary dark:hover:bg-primary cursor-pointer"
                    onClick={() => setShowYesterdayLoansModal(true)}
                  >
                    <span className="text-sm text-slate-500 dark:text-white">
                      Préstamos ayer
                    </span>
                    <p className="text-lg font-bold text-black dark:text-white">
                      {createdLoansYesterdayCount}
                    </p>
                  </div>
                </div>
              </div>

              {(user?.role === "finanzas" || user?.role === "administrador") && (
                <div className="p-4 bg-white rounded-2xl dark:bg-slate-900">
                  <h4 className="text-lg font-bold text-black dark:text-white border-b-2 border-slate-300 mb-4">
                    Resumen del mes
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2">
                      <span className="text-sm text-slate-500">Dinero Recaudado</span>
                      <p className="text-lg font-bold text-black dark:text-white">
                        ${monthRecaudado.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2">
                      <span className="text-sm text-slate-500">Préstamos Creados</span>
                      <p className="text-lg font-bold text-black dark:text-white">
                        {monthLoansCreated}
                      </p>
                    </div>
                    <div className="p-2">
                      <span className="text-sm text-slate-500">Impagos</span>
                      <p className="text-lg font-bold text-black dark:text-white">
                        ${monthImpagos.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2">
                      <span className="text-sm text-slate-500">
                        Pagos registrados en el mes
                      </span>
                      <p className="text-lg font-bold text-black dark:text-white">
                        {monthPagosRegistrados}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(user?.role === "administrador" || user?.role === "finanzas") && (
              <div className="flex-col w-full p-4 mb-6 rounded-lg shadow-sm">
                <GraficaDePagos pagosPorMes={pagosPorMes} impagos={impagos} />
              </div>
            )}
          </main>

          {showModalWidthdraw && (
            <ModalWidthdrawal
              showModal={showModalWidthdraw}
              setShowModal={setShowModalWidthdraw}
            />
          )}
          {showModalCapital && (
            <ModalCapital
              showModal={showModalCapital}
              setShowModal={setShowModalCapital}
            />
          )}
          {showModalBill && (
            <ModalBill showModal={showModalBill} setShowModal={setShowModalBill} />
          )}
          {showModalTomorrow && (
            <ModalTomorrow
              showModal={showModalTomorrow}
              setShowModal={setShowModalTomorrow}
              prestamos={pendingPaymentsTomorrowDetails}
            />
          )}
          {showPending && (
            <ModalPendingPayments
              showModal={showPending}
              setShowModal={setShowPending}
              prestamos={pendingPaymentsTodayDetails}
            />
          )}
          {showTodayModal && (
            <TodayPaymentsModal
              showModal={showTodayModal}
              setShowModal={setShowTodayModal}
              prestamos={paymentsTodayDetails}
            />
          )}

          {showTodayClientsModal && (
            <TodayClientsModal
              showModal={showTodayClientsModal}
              setShowModal={setShowTodayClientsModal}
              clients={clientsTodayList}
            />
          )}
          {showYesterdayLoansModal && (
            <YesterdayLoansModal
              showModal={showYesterdayLoansModal}
              setShowModal={setShowYesterdayLoansModal}
              prestamos={loansYesterdayList}
            />
          )}
          {showTodayLoansModal && (
            <TodayLoansModal
              showModal={showTodayLoansModal}
              setShowModal={setShowTodayLoansModal}
              prestamos={loansTodayList}
            />
          )}

          <ToastContainer />
        </div>
      )}
    </>
  );
}
