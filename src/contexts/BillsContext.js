"use client";
// src/contexts/BillsContext.js
import React, { createContext, useEffect, useState } from 'react';
import axios from '@component/config/axios';
import Swal from 'sweetalert2';
import moment from 'moment';

const BillsContext = createContext();

const BillsProvider = ({ children }) => {
  const [bills, setBills] = useState([]);

  const getBills = async () => {
    try {
      const token = window.localStorage.getItem('token');
       const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
      }
      const res = await axios('/bills', config);
      setBills(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  const addBill = async (bill) => {
    try {
      const token = window.localStorage.getItem('token');
       const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
      }
      // Agregar Gasto
      const response = await axios.post('/bills', bill, config);

      // Obtener Gastos
      getBills();
    } catch (error) {
      console.log(error);
    }
  }

  const deleteBill = id => {
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
        await axios.delete(`/bills/${id}`, config);
        await getBills();
        Swal.fire({
          title: "Deleted!",
          text: "Gasto eliminado correctamente.",
          icon: "success"
        });
      }
    }).catch((error) => {
      console.log(error);
    })
  }

  useEffect(() => {
    getBills();
  }, [])
  

  return (
    <BillsContext.Provider value={{
      bills,
      getBills,
      addBill,
      deleteBill
    }}>
      {children}
    </BillsContext.Provider>
  );
};

export { BillsProvider, BillsContext };