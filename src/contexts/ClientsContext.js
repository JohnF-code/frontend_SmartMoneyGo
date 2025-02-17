"use client";

import React, { createContext, useState, useEffect } from "react";
import axios from "@component/config/axios";
import Swal from "sweetalert2";
import { io } from "socket.io-client";

export const ClientsContext = createContext();

export const ClientsProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentClient, setCurrentClient] = useState({});

  // Socket
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_STOCK_IO_URL || "http://localhost:5000";
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log("[ClientsContext] socket conectado ->", socket.id);
    });

    // Cuando se emita clientUpdated, refrescamos
    socket.on("clientUpdated", (data) => {
      console.log("[ClientsContext] clientUpdated =>", data);
      getClients();
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getClients = async () => {
    try {
      setLoading(true);
      const token = window.localStorage.getItem("token");
      if (!token) {
        setClients([]);
        return;
      }
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get("/clients", config);
      setClients(data);
    } catch (err) {
      console.error("[getClients] error =>", err);
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (paymentData, onClose = ()=>{}) => {
    try {
      const token = window.localStorage.getItem("token");
      if (!token) return;
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      onClose(true);
      await axios.post("/payments", paymentData, config);
      Swal.fire("OK", "Pago registrado con éxito", "success");
    } catch (err) {
      console.error("[addPayment] error =>", err);
      Swal.fire("Error", "No se pudo registrar el pago", "error");
    }
  };

  // Otras funciones: addClient, deleteClient, etc. si las necesitas
  const addClient = async client => {
    try {
      const token = window.localStorage.getItem('token');

      client.balance = (Number(client.loanAmount) + (Number(client.loanAmount) * (Number(client.interest) / 100))).toFixed(2);
      
      // Mostrar mensaje de carga
      Swal.fire({
        title: "Procesando...",
        text: "Detectando ubicación y creando cliente. Por favor, espera.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      // Obtener Ubicación actual usando la API de geolocalización del navegador
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;  
          const lng = position.coords.longitude;
          console.log("cordenadas no se pq no salen bien", lat, lng)
  
          // Asignar las coordenadas redondeadas al cliente
          client.coordinates = [lat, lng];
          
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            }
          }
    
          // Agregar cliente
          await axios.post('/clients', client, config);
    
          // Obtener todos los clientes
          await getClients();
  
          // Mostrar notificación de éxito
          Swal.fire({
            title: "¡Éxito!",
            text: "Cliente creado correctamente con ubicación detectada automáticamente.",
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
          });
        }, (error) => {
          console.error("Error obteniendo ubicación: ", error);
          Swal.close(); // Cierra el modal de carga
          showLocationModal(client); // Llamar al modal si falla la geolocalización
        });
      } else {
        console.log("Geolocalización no soportada en este navegador.");
        Swal.close(); // Cierra el modal de carga
        showLocationModal(client); // Llamar al modal si no soporta la geolocalización
      }
    } catch (error) {
      console.log('Error adding client:', error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al crear el cliente.",
        icon: "error",
      });
    }
  };

  const deleteClient = async id => {
    const token = window.localStorage.getItem('token');
    
    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    }

    Swal.fire({
      title: "¿Estas seguro?",
      text: "Una vez eliminado, no podrás devolver los cambios",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Request
        await axios.delete(`/clients/${id}`, config);
        await getClients();
        Swal.fire({
          title: "Deleted!",
          text: "Cliente eliminado correctamente.",
          icon: "success"
        });
      }
    }).catch((error) => {
      console.log(error);
    })
  }

  return (
    <ClientsContext.Provider
      value={{
        clients,
        loading,
        getClients,
        addPayment,
        addClient,
        deleteClient,
        currentClient,
        setCurrentClient
      }}
    >
      {children}
    </ClientsContext.Provider>
  );
};
