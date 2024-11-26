"use client";
// src/contexts/ClientsContext.js
import React, { createContext, useEffect, useState } from 'react';
import axios from '@component/config/axios';
import axiosInstance from 'axios';
import Swal from 'sweetalert2';
import moment from 'moment';

const ClientsContext = createContext();

const ClientsProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [currentClient, setCurrentClient] = useState({});
  const [loading, setLoading] = useState(true);
  
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
      
      // Obtener Ubicación actual
      const coordinates = await axiosInstance('/api/googleGeolocate');

      client.coordinates = coordinates.data;

      const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
      }

      // Add client
      await axios.post('/clients', client, config);

      // Get clients
      await getClients();  
    } catch (error) {
        console.log(error);
    }
  }

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