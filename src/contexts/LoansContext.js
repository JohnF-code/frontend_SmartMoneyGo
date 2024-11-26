"use client";
// src/contexts/LoansContext.js
import React, { createContext, useEffect, useState } from 'react';
import axios from '@component/config/axios';
import Swal from 'sweetalert2';

const LoansContext = createContext();

const LoansProvider = ({ children }) => {
  const [loans, setLoans] = useState([]);
  const [currentClient, setCurrentClient] = useState({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  
  useEffect(() => {
    setToken(window.localStorage.getItem('token'));
    getLoans();
  }, [])

  const getLoans = async (all) => {
    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem('token')}`
        }
    }

    try {
      const request = await axios('/loans', config);
      const data = request.data.reverse();
      if (all) {
        setLoans(data);
        return
      }
      const activeLoans = data.filter(loan => loan.terminated === false)
      setLoans(activeLoans);
    } catch (error) {
      console.log(error);
    }
  }

  const addLoan = async loan => {
    try {
      const balance = (Number(loan.loanAmount) + (Number(loan.loanAmount) * (Number(loan.interest) / 100))).toFixed(2);

      loan.balance = balance;
      loan.installmentValue = balance / loan.installments;
      
      const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem('token')}`
        }
      }

      // Add loan
      await axios.post('/loans', loan, config);

      // Get clients
      await getLoans();  
    } catch (error) {
        console.log(error);
    }
  }

  const updateLoan = async loan => {
    
    try {
      const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${window.localStorage.getItem('token')}`
        }
      }
      const request = await axios.put(`/loans/${loan._id}`, loan, config);

      console.log(request);
      getLoans();
    } catch (error) {
      console.log(error);
    }
  }

  const deleteLoan = async id => {
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
        await axios.delete(`/loans/${id}`, config);
        await getLoans();
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
    <LoansContext.Provider value={{
      loans,
      getLoans,
      addLoan,
      deleteLoan,
      updateLoan
    }}>
      {children}
    </LoansContext.Provider>
  );
};

export { LoansProvider, LoansContext };