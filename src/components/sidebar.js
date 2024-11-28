"use client";
// src/components/Sidebar.js
import Link from 'next/link';
import { useAuth } from '@component/hooks/useAuth';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const Sidebar = () => {

  const { user } = useAuth();

  const currentLocation = usePathname();
  console.log(currentLocation);

  return (
    <aside className="w-64 bg-white shadow-md hidden lg:block dark:bg-slate-900">
      <div className="p-6">
        <h1 className="text-black text-2xl font-semibold dark:text-white">Dashboard</h1>
      </div>
      <nav className="mt-10">
        {user.role !== 'cobrador' ?
          <Link href="/admin/dashboard" className={`block py-2.5 px-4 transition duration-200 hover:bg-gray-400 dark:text-white ${currentLocation === '/admin/dashboard' ? 'bg-blue-700 text-white' : 'text-gray-900'}`}>
            Dashboard
          </Link>
          : ''}
        <Link href="/admin/clientes" className={`block py-2.5 px-4 transition duration-200 hover:bg-gray-400 dark:text-white ${currentLocation === '/admin/clientes' ? 'bg-blue-700 text-white' : 'text-gray-900'}`}>
          Clientes
        </Link>

        <Link href="/admin/prestamos" className={`block py-2.5 px-4 transition duration-200 hover:bg-gray-400 dark:text-white ${currentLocation === '/admin/prestamos' ? 'bg-blue-700 text-white' : 'text-gray-900'}`}>
          Prestamos
        </Link>
     
          <Link href="/admin/historial" className={`block py-2.5 px-4 transition     duration-200 hover:bg-gray-400 dark:text-white ${currentLocation === '/admin/historial' ? 'bg-blue-700 text-white' : 'text-gray-900'}`}>
            Historial De Clientes
          </Link>
    
         <Link href="/admin/pagos" className={`block py-2.5 px-4 transition duration-200 hover:bg-gray-400 dark:text-white ${currentLocation === '/admin/pagos' ? 'bg-blue-700 text-white' : 'text-gray-900'}`}>
          Pagos
        </Link>
        {user.role === 'finanzas' || user.role === 'administrador' ?
          <Link href="/admin/finanzas" className={`block py-2.5 px-4 transition duration-200 hover:bg-gray-400 dark:text-white ${currentLocation === '/admin/finanzas' ? 'bg-blue-700 text-white' : 'text-gray-900'}`}>
            Finanzas
          </Link>
          : ''}
        {user.role === 'administrador' ?
          <Link href="/admin/users" className={`block py-2.5 px-4 transition duration-200 hover:bg-gray-400 dark:text-white ${currentLocation === '/admin/users' ? 'bg-blue-700 text-white' : 'text-gray-900'}`}>
            Usuarios
          </Link>
        : ''}
      </nav>
    </aside>
  );
}

export default Sidebar;