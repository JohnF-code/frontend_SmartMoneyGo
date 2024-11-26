"use client";
// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from '@component/config/axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({});
  const [isLoaded, setIsLoaded] = useState(null);
  
  useEffect(() => {
    const authenticateUser = async () => {
      const token = window.localStorage.getItem('token');
      if (!token) {
        setMessage({
          type: 'error',
          msg: 'Invalid Token'
        })
        setLoading(false);
        return;
      }
    
      const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
      }

      try {
          const response = await axios('/users/profile', config);
          console.log(response.data);
        setUser(response.data.user);
        setLoading(false);
      } catch (error) {
          setLoading(false);
      } 
    }
    authenticateUser();
  }, []);
  
  const login = async ({email, password}) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      window.localStorage.setItem('token', response.data.token);
      setUser(response.data.user);

      setMessage({
        type: 'success',
        msg: 'Usuario Autenticado correctamente'
      })
      setLoading(false);
    } catch (error) {
      setMessage({
        type: 'error',
        msg: error.response.data.message
      })
    }
  };

  const logout = () => {
    window.localStorage.removeItem('token');
    setUser(null);
    history.push('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      message,
      isLoaded,
      setIsLoaded,
      setMessage,
      loading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
