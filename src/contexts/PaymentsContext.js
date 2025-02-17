"use client"; // src/contexts/PaymentsContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "@component/config/axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const PaymentsContext = createContext();

const PaymentsProvider = ({ children }) => {
  const [payments, setPayments] = useState([]);
  const [capital, setCapital] = useState([]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_STOCK_IO_URL || "http://localhost:5000";
    const socket = io(socketUrl);

    socket.on("paymentUpdated", (data) => {
      console.log("Evento paymentUpdated:", data.message);
      getPayments();
      toast.success(data.message);
    });

    socket.on("financeUpdated", (data) => {
      console.log("Evento financeUpdated:", data.message);
      getCapital();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getPayments = async () => {
    const token = window.localStorage.getItem("token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const { data } = await axios("/payments", config);
      setPayments(data);
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const getCapital = async () => {
    try {
      const token = window.localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios("/finances", config);
      setCapital(data);
    } catch (error) {
      console.log(error);
    }
  };

  const postCapital = async (cap) => {
    try {
      const token = window.localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post("/finances", cap, config);
      getCapital();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteCapital = (id) => {
    const token = window.localStorage.getItem("token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    Swal.fire({
      title: "¿Estas seguro?",
      text: "Una vez eliminado, no podrás devolver los cambios",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar!",
    })
      .then(async (result) => {
        if (result.isConfirmed) {
          await axios.delete(`/finances/${id}`, config);
          await getCapital();
          Swal.fire({
            title: "Deleted!",
            text: "Capital eliminado correctamente.",
            icon: "success",
          });
        }
      })
      .catch((error) => {
        console.log(error);
        toast.error("Hubo un error");
      });
  };

  const deletePayment = async (id) => {
    const token = window.localStorage.getItem("token");
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    Swal.fire({
      title: "¿Estas seguro?",
      text: "Una vez eliminado, no podrás devolver los cambios",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar!",
    })
      .then(async (result) => {
        if (result.isConfirmed) {
          const deletedPayment = await axios.delete(`/payments/${id}`, config);
          console.log(deletedPayment);
          await getPayments();
          Swal.fire({
            title: "Deleted!",
            text: "Pago eliminado correctamente.",
            icon: "success",
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <PaymentsContext.Provider
      value={{
        payments,
        setPayments,
        getPayments,
        capital,
        getCapital,
        postCapital,
        deleteCapital,
        deletePayment,
      }}
    >
      {children}
    </PaymentsContext.Provider>
  );
};

export { PaymentsProvider, PaymentsContext };
