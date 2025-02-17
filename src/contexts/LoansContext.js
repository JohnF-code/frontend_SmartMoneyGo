"use client";
import React, { createContext, useEffect, useState } from "react";
import axios from "@component/config/axios";
import Swal from "sweetalert2";
import { io } from "socket.io-client";

const LoansContext = createContext();

export const LoansProvider = ({ children }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Al montar: cargar préstamos
  useEffect(() => {
    // Llamar 1 sola vez
    getLoans(false);

    // Socket
    const socketUrl = process.env.NEXT_PUBLIC_STOCK_IO_URL || "http://localhost:5000";
    const socket = io(socketUrl);

    socket.on("loanUpdated", (data) => {
      console.log("Préstamo actualizado => recargando loans:", data.message);
      getLoans(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getLoans = async (all = false) => {
    try {
      setLoading(true);
      const token = window.localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      // Petición
      let { data } = await axios.get("/loans", config);
      // Filtrar si no queremos ver "terminated"
      if (!all) {
        data = data.filter((loan) => loan.terminated === false);
      }
      // Sort descendente o algo similar
      data.reverse();
      setLoans(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addLoan = async (loan) => {
    try {
      const token = window.localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post("/loans", loan, config);
      getLoans(false);
    } catch (error) {
      console.log(error);
    }
  };

  const updateLoan = async (loan) => {
    try {
      const token = window.localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(`/loans/${loan._id}`, loan, config);
      getLoans(false);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteLoan = async (id) => {
    try {
      const token = window.localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción es irreversible.",
        icon: "warning",
        showCancelButton: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          await axios.delete(`/loans/${id}`, config);
          Swal.fire("Eliminado!", "El préstamo ha sido eliminado.", "success");
          getLoans(false);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <LoansContext.Provider
      value={{
        loans,
        loading,
        getLoans,
        addLoan,
        updateLoan,
        deleteLoan,
      }}
    >
      {children}
    </LoansContext.Provider>
  );
};

export { LoansContext };
