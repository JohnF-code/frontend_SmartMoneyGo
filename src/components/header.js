"use client";
// src/components/Header.js
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { usePathname } from 'next/navigation';
import ThemeToggle from "@component/components/ThemeToggle";

const Header = () => {

  const { user } = useAuth();
  const [hide, setHide] = useState(true);

  const currentLocation = usePathname();

  return (
    <header className="bg-white border-gray-200 dark:bg-gray-900 mb-8">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link
          href="/"
          className='text-black text-2xl font-bold dark:text-white'
        >SmartMoneyGo</Link>
        <button
          type="button"
          className='lg:hidden'
          aria-controls="navbar-default"
          aria-expanded="false"
          onClick={() => setHide(!hide)}
        >
            <FontAwesomeIcon icon={faBars} className='text-3xl text-black dark:text-white'/>
        </button>
        <ThemeToggle />
        <nav className={`${hide ? 'hidden' : 'block'} w-full lg:hidden" id="navbar-default`}>
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 ">
            {user.role !== 'cobrador' ?
              <li>
                <Link href="/admin/dashboard" className={`block py-2 px-3 ${currentLocation === '/admin/dashboard' ? 'bg-blue-700 text-white' : 'text-gray-900'} rounded dark:text-white`} onClick={() => setHide(true)}>Dashboard</Link>
              </li>
              : ''}
            <li>
              <Link href="/admin/clientes" className={`block py-2 px-3 ${currentLocation === '/admin/clientes' ? 'bg-blue-700 text-white' : 'text-gray-900'} rounded md:bg-transparent dark:text-white`} onClick={() => setHide(true)}>Clientes</Link>
            </li>
            <li>
              <Link href="/admin/prestamos" className={`block py-2 px-3 ${currentLocation === '/admin/prestamos' ? 'bg-blue-700 text-white' : 'text-gray-900'} rounded md:bg-transparent dark:text-white`}>Prestamos</Link>
            </li>
            <li>
              <Link href="pagos" className={`block py-2 px-3 ${currentLocation === '/admin/pagos' ? 'bg-blue-700 text-white' : 'text-gray-900'} rounded dark:text-white`} onClick={() => setHide(true)}>Pagos</Link>
            </li>
            {user.role === 'finanzas' || user.role === 'administrador' ?
              <li>
                <Link href="finanzas" className={`block py-2 px-3 ${currentLocation === '/admin/finanzas' ? 'bg-blue-700 text-white' : 'text-gray-900'} rounded dark:text-white`} onClick={() => setHide(true)}>Finanzas</Link>
              </li>
              : ''}
            {user.role === 'administrador' ?
              <li>
                <Link href="/admin/users" className={`block py-2 px-3 ${currentLocation === '/admin/users' ? 'bg-blue-700 text-white' : 'text-gray-900'} rounded dark:text-white`} onClick={() => setHide(true)}>Usuarios</Link>
              </li>
            : ''}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;