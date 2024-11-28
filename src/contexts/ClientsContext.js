"use client";
// src/contexts/ClientsContext.js
import React, { createContext, useEffect, useState } from 'react';
import axios from '@component/config/axios';
import axiosInstance from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';
import { io } from 'socket.io-client';

const ClientsContext = createContext();

const ClientsProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Conexión al WebSocket
    const socketUrl = process.env.NEXT_PUBLIC_STOCK_IO_URL || 'http://localhost:5000';
    const socket = io(socketUrl); // Conexión al servidor WebSocket

    // Escuchar el evento 'clientUpdated' (nuevo cliente agregado o cliente eliminado)
    socket.on('clientUpdated', (data) => {
      console.log(data.message); // Depuración

      if (data.client) {
        // Si es un cliente eliminado, eliminarlo de la lista
        if (data.message === 'Cliente eliminado') {
          setClients(prevClients => prevClients.filter(client => client._id !== data.client._id));
        } else {
          // Si es un cliente agregado, añadirlo a la lista
          setClients(prevClients => [...prevClients, data.client]);
        }
      }
    });

    // Desconectar al desmontar el componente
    return () => {
      socket.disconnect();
    };
  }, []);
  
  useEffect(() => {
    getClients();
  }, [])

  const getClients = async () => {
    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem('token')}`
        }
    }

    try {
      const request = await axios('/clients', config);
      const data = request.data.sort((a, b) => moment(b.date).unix() - new moment(a.date).unix());
      setClients(data);
    } catch (error) {
      console.log(error);
    }
  }

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
  
  const showLocationModal = (client) => {
    Swal.fire({
      title: "Especifica tu ubicación",
      html: `
        <h1>No encontramos tu ubicacion, le solicitamos que la seleccione manualmente.</h1>
        <div id="map" style="width: 100%; height: 400px;"></div>
        <input type="hidden" id="selectedLat" />
        <input type="hidden" id="selectedLng" />
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar ubicación',
      preConfirm: () => {
        const lat = document.getElementById('selectedLat').value; // Mantén el valor como cadena
        const lng = document.getElementById('selectedLng').value; // Mantén el valor como cadena
        
        
        if (!lat || !lng) {
          Swal.showValidationMessage('Debes seleccionar una ubicación.');
        } else {
          client.coordinates = [lat, lng];
          return client;
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire({
          title: "Procesando...",
          text: "Creando cliente. Por favor, espera.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
  
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem('token')}`,
          }
        }
  
        // Agregar cliente con la ubicación manualmente especificada
        await axios.post('/clients', result.value, config);
        await getClients();
  
        // Mostrar notificación de éxito
        Swal.fire({
          title: "¡Éxito!",
          text: "Cliente creado correctamente con ubicación seleccionada manualmente.",
          icon: "success",
          timer: 3000,
          showConfirmButton: false,
        });
  }
    });
  
    // Inicializar Google Maps
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 7.889100, lng: -72.496700 }, // Coordenadas iniciales (Colombia, Cucuta) 
      zoom: 12,
    });
  
    const marker = new google.maps.Marker({
      position: map.getCenter(),
      map: map,
      draggable: true,
    });
  
    // Actualizar lat y lng en el formulario
    google.maps.event.addListener(marker, 'dragend', () => {
      const position = marker.getPosition();
      document.getElementById('selectedLat').value = position.lat();
      document.getElementById('selectedLng').value = position.lng();
    });
  };
  


  const updateClient = async client => {
    try {
      const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem('token')}`
        }
      }

      const res = await axios.put(`/clients/${client.id}`, client, config);
      
      await getClients();
      return res.data;

    } catch (error) {
      console.log(error);
    }
  }

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
  
  const addPayment = async (client) => {
    const token = window.localStorage.getItem('token');
    // Get Current client
    const config = {
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
      }
    }
    const request = await axios.post('/payments', client, config);
    await getClients();
    
    console.log(request);
    return request.data;
  }

  return (
    <ClientsContext.Provider value={{
      clients,
      setClients,
      addClient,
      getClients,
      addPayment,
      deleteClient,
      updateClient,
      currentClient,
      setCurrentClient
    }}>
      {children}
    </ClientsContext.Provider>
  );
};

export { ClientsProvider, ClientsContext };