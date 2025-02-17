"use client";

import { useState, useEffect } from "react";
import Button from "@component/components/Button";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CobradoresPage() {
  const [cobradores, setCobradores] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);

  // Cargar cobradores (usuarios con rol "cobrador")
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => {
        // Filtrar solo los cobradores
        const cobr = data.filter(user => user.role === "cobrador");
        setCobradores(cobr);
      })
      .catch(err => console.error(err));
  }, []);

  // Cargar rutas para asignar
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/routes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setRutas(data))
      .catch(err => console.error(err));
  }, []);

  // Función para asignar rutas a un cobrador
  const asignarRutas = (cobradorId, rutasAsignadas) => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${cobradorId}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ rutasAsignadas })
    })
      .then(res => res.json())
      .then(data => {
        // Actualizar la lista local
        setCobradores(cobradores.map(cobrador => cobrador._id === cobradorId ? data : cobrador));
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Administrar Cobradores</h1>
      <div>
        {cobradores.length > 0 ? (
          cobradores.map(cobrador => (
            <div key={cobrador._id} className="border p-2 mb-2 rounded flex justify-between items-center">
              <div>
                <h2 className="font-bold">{cobrador.name}</h2>
                <p>{cobrador.email}</p>
              </div>
              <Button variant="secondary" onClick={() => setSeleccionado(cobrador)}>
                Asignar Rutas
              </Button>
            </div>
          ))
        ) : (
          <p>No hay cobradores registrados.</p>
        )}
      </div>

      {/* Modal simple para asignar rutas */}
      {seleccionado && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-700 p-4 rounded w-full max-w-md">
            <h2 className="font-bold mb-2">Asignar Rutas a {seleccionado.name}</h2>
            <div className="mb-4">
              {rutas.map(ruta => (
                <div key={ruta._id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={seleccionado.rutasAsignadas?.includes(ruta._id) || false}
                    onChange={(e) => {
                      let nuevasRutas = seleccionado.rutasAsignadas || [];
                      if (e.target.checked) {
                        nuevasRutas = [...nuevasRutas, ruta._id];
                      } else {
                        nuevasRutas = nuevasRutas.filter(id => id !== ruta._id);
                      }
                      setSeleccionado({ ...seleccionado, rutasAsignadas: nuevasRutas });
                    }}
                  />
                  <span className="ml-2">{ruta.nombre}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSeleccionado(null)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => {
                asignarRutas(seleccionado._id, seleccionado.rutasAsignadas || []);
                setSeleccionado(null);
              }}>
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sección de estadísticas de cobranza para cobradores */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Estadísticas de Cobranza</h2>
        {/* Aquí puedes agregar gráficos o un resumen */}
        {/* Ejemplo simple: Filtrar por cobrador y mostrar totales */}
        <p>Esta sección mostrará estadísticas de cobranza (total cobrado, pendiente, cantidad de préstamos, etc.).</p>
      </div>

      <ToastContainer />
    </div>
  );
}
