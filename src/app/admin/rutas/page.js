"use client";

import { useState, useEffect } from "react";
import Button from "@component/components/Button";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RutasPage() {
  const [rutas, setRutas] = useState([]);
  const [nuevaRuta, setNuevaRuta] = useState({ nombre: "", descripcion: "" });
  
  // Cargar rutas desde el backend
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/routes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setRutas(data))
      .catch(err => console.error(err));
  }, []);

  const handleCrearRuta = () => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/routes`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(nuevaRuta)
    })
      .then(res => res.json())
      .then(data => {
        setRutas([...rutas, data]);
        setNuevaRuta({ nombre: "", descripcion: "" });
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Administrar Rutas</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Nombre de la ruta"
          value={nuevaRuta.nombre}
          onChange={(e) => setNuevaRuta({ ...nuevaRuta, nombre: e.target.value })}
          className="px-4 py-2 border rounded-lg mr-2"
        />
        <input
          type="text"
          placeholder="Descripción"
          value={nuevaRuta.descripcion}
          onChange={(e) => setNuevaRuta({ ...nuevaRuta, descripcion: e.target.value })}
          className="px-4 py-2 border rounded-lg mr-2"
        />
        <Button variant="primary" onClick={handleCrearRuta}>
          Crear Ruta
        </Button>
      </div>
      <div>
        {rutas.length > 0 ? (
          <ul>
            {rutas.map((ruta) => (
              <li key={ruta._id} className="border p-2 mb-2 rounded">
                <h2 className="font-bold">{ruta.nombre}</h2>
                <p>{ruta.descripcion}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay rutas registradas.</p>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
