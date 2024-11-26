"use client";
// src/contexts/BillsContext.js
import React, { createContext, useEffect, useState } from 'react';
import axios from '@component/config/axios';
import Swal from 'sweetalert2';
import moment from 'moment';
import { toast } from 'react-toastify';

const WithdrawalContext = createContext();

const WithdrawalProvider = ({ children }) => {
  const [withdrawals, setWithdrawals] = useState([]);

  const getWithdrawals = async () => {
    try {
      const token = window.localStorage.getItem('token');
       const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
      }
      const res = await axios('/withdrawals', config);
      setWithdrawals(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  const addWithdrawal = async withdrawal => {
    try {
      const token = window.localStorage.getItem('token');
       const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
      }
      // Agregar Gasto
      const response = await axios.post('/withdrawals', withdrawal, config);

      // Obtener Gastos
      getWithdrawals();
    } catch (error) {
      console.log(error);
    }
  }

  const deleteWithdrawal = id => {
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
        await axios.delete(`/withdrawals/${id}`, config);
        await getWithdrawals();
        Swal.fire({
          title: "Deleted!",
          text: "Retiro eliminado correctamente.",
          icon: "success"
        });
      }
    }).catch((error) => {
      console.log(error);
      toast.error('Hubo un error');
    })
  }

  useEffect(() => {
    getWithdrawals();
  }, [])
  

  return (
    <WithdrawalContext.Provider value={{
      withdrawals,
      getWithdrawals,
      addWithdrawal,
      deleteWithdrawal
    }}>
      {children}
    </WithdrawalContext.Provider>
  );
};

export { WithdrawalProvider, WithdrawalContext };