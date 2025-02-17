"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Button from "@component/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { formatearFecha } from "@component/helpers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NuevoPrestamoModal({ show, onClose, client, onSave }) {
  // manualMode: false => modo automático (usuario ingresa cuotas)
  // true => modo manual (usuario ingresa cuota y se calcula cuotas)
  const [manualMode, setManualMode] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    loanAmount: "",
    interest: "20",
    installments: "",
    startPrestamo: new Date().toISOString().slice(0, 10), // Formato YYYY-MM-DD
    ruta: "",
    ubicarDespuesDe: "",
    installmentValue: "",
  });
  const [routes, setRoutes] = useState([]);
  const [routeLoans, setRouteLoans] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [appliedInterest, setAppliedInterest] = useState(null);

  // Cargar rutas
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/routes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (formData.ruta) {
      setLoadingRoutes(true);
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/loans?ruta=${formData.ruta}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setRouteLoans(data);
          setLoadingRoutes(false);
        })
        .catch((err) => {
          console.error(err);
          setLoadingRoutes(false);
        });
    }
  }, [formData.ruta]);

  // Función para calcular el valor de la cuota en modo automático
  const calculateCuota = () => {
    const L = Number(formData.loanAmount);
    const i = Number(formData.interest);
    const n = Number(formData.installments);
    if (!L || !i || !n) return "";
    let effectiveInterest = i;
    if (n > 30) {
      effectiveInterest = Math.round((i / 30) * n);
    }
    setAppliedInterest(effectiveInterest);
    const totalRepayment = L * (1 + effectiveInterest / 100);
    const cuota = totalRepayment / n;
    // Redondea hacia arriba al siguiente múltiplo de 100
    return Math.ceil(cuota / 100) * 100;
  };

  // Función para calcular el número de cuotas en modo manual
  const calculateInstallments = () => {
    const L = Number(formData.loanAmount);
    const i = Number(formData.interest);
    const C = Number(formData.installmentValue);
    if (!L || !i || !C) return "";
    let n = L * (1 + i / 100) / C;
    if (n <= 30) return Math.ceil(n);
    let effectiveInterest = Math.round((i / 30) * n);
    let T = L * (1 + effectiveInterest / 100);
    let newN = T / C;
    let iterations = 0;
    while (Math.abs(newN - n) > 0.1 && iterations < 10) {
      n = newN;
      effectiveInterest = Math.round((i / 30) * n);
      T = L * (1 + effectiveInterest / 100);
      newN = T / C;
      iterations++;
    }
    return Math.ceil(newN);
  };

  // Debounce de 3 segundos para el cálculo automático del valor de la cuota
  useEffect(() => {
    if (!manualMode) {
      setIsCalculating(true);
      const timer = setTimeout(() => {
        const cuotaCalculated = calculateCuota();
        setFormData((prev) => ({ ...prev, installmentValue: cuotaCalculated }));
        setIsCalculating(false);
      }, 3000);
      return () => {
        clearTimeout(timer);
        setIsCalculating(false);
      };
    }
  }, [formData.loanAmount, formData.interest, formData.installments, manualMode]);

  // Debounce de 3 segundos para el cálculo manual del número de cuotas
  useEffect(() => {
    if (manualMode && formData.installmentValue && Number(formData.installmentValue) > 0) {
      setIsCalculating(true);
      const timer = setTimeout(() => {
        const installmentsCalculated = calculateInstallments();
        setFormData((prev) => ({ ...prev, installments: installmentsCalculated }));
        setIsCalculating(false);
      }, 3000);
      return () => {
        clearTimeout(timer);
        setIsCalculating(false);
      };
    }
  }, [formData.loanAmount, formData.interest, formData.installmentValue, manualMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleManualMode = () => {
    setManualMode((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave({ ...formData, clientId: client._id });
      toast.success("Préstamo creado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el préstamo");
    }
    onClose();
  };

  // Calcular fecha de fin del préstamo sin contar domingos
  const getEndPrestamo = () => {
    const start = formData.startPrestamo;
    const n = Number(formData.installments);
    if (!start || !n) return "";
    let date = new Date(start);
    let count = 0;
    while (count < n) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0) { // 0 = domingo
        count++;
      }
    }
    return date.toISOString().slice(0, 10);
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  return (
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
              <h2 className="text-xl font-bold">Nuevo Préstamo para {client.name}</h2>
              <div className="mt-2">
                <Button variant="secondary" onClick={toggleManualMode}>
                  {manualMode
                    ? "Usar cálculo automático de cuota"
                    : "Ingresar cuota manualmente"}
                </Button>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm mb-1">Descripción</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="flex gap-2 mb-4">
                <div className="w-1/2">
                  <label className="block text-sm mb-1">Monto</label>
                  <input
                    type="number"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm mb-1">Interés (%)</label>
                  <input
                    type="number"
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
              {manualMode ? (
                <div className="flex gap-2 mb-4">
                  <div className="w-1/2">
                    <label className="block text-sm mb-1">Valor de la Cuota</label>
                    <input
                      type="number"
                      name="installmentValue"
                      value={formData.installmentValue}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm mb-1">Cuotas (calculadas)</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="installments"
                        value={formData.installments}
                        readOnly
                        className="w-full border p-2 rounded bg-gray-100"
                      />
                      {isCalculating && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                          <span className="text-xs text-gray-500">Calculando...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mb-4">
                  <div className="w-1/2">
                    <label className="block text-sm mb-1">Cuotas</label>
                    <input
                      type="number"
                      name="installments"
                      value={formData.installments}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm mb-1">Valor de la Cuota</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="installmentValue"
                        value={formData.installmentValue}
                        readOnly
                        className="w-full border p-2 rounded bg-gray-100"
                      />
                      {isCalculating && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-60">
                          <span className="text-xs text-gray-500">Calculando...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {Number(formData.installments) > 30 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-700">
                    Interés aplicado: {appliedInterest}% (calculado según {formData.installments} cuotas)
                  </p>
                </div>
              )}
              {/* Campos de Inicio y Fin del Préstamo */}
              <div className="flex gap-2 mb-4">
                <div className="w-1/2">
                  <label className="block text-sm mb-1">Inicio Préstamo</label>
                  <input
                    type="date"
                    name="startPrestamo"
                    value={formData.startPrestamo}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm mb-1">Fin del Préstamo</label>
                  <input
                    type="text"
                    name="endPrestamo"
                    value={getEndPrestamo()}
                    readOnly
                    className="w-full border p-2 rounded bg-gray-100"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Ruta</label>
                <select
                  name="ruta"
                  value={formData.ruta}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Seleccionar ruta</option>
                  {routes.map((ruta) => (
                    <option key={ruta._id} value={ruta._id}>
                      {ruta.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Ubicar después de (opcional)</label>
                {loadingRoutes ? (
                  <p>Cargando préstamos de la ruta...</p>
                ) : (
                  <select
                    name="ubicarDespuesDe"
                    value={formData.ubicarDespuesDe}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  >
                    <option value="">Al inicio (predeterminado)</option>
                    {routeLoans.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.clientId?.name} - {formatearFecha(l.date)}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose} type="button">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
      <ToastContainer />
    </Transition>
  );
}
