"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faSignOutAlt,
  faHome,
  faUsers,
  faDollarSign,
  faHistory,
  faFileInvoiceDollar,
  faUserShield,
  faChartPie, // Para finanzas
} from "@fortawesome/free-solid-svg-icons";
import { usePathname } from "next/navigation";
import ThemeToggle from "@component/components/ThemeToggle";

/**
 * Este Header:
 * - Mobile (<768px): 
 *    - Ícono hamburguesa a la izquierda con animación al abrir/cerrar
 *    - Nombre usuario al centro
 *    - Dark toggle y botón salir a la derecha
 *    - 2da fila: iconos horizontales (acceso rápido)
 *    - Al hacer clic en hamburguesa => menú con texto+iconos “empuja” contenido
 * - Desktop (>=768px):
 *    - NO hay hamburguesa
 *    - Logo/“SmartMoneyGo” a la izquierda con link al Dashboard
 *    - Nombre usuario al centro
 *    - Dark toggle y salir a la derecha
 *    - 2da fila de iconos => se puede mostrar/ocultar según prefieras 
 */
export default function Header() {
  const { user, logout } = useAuth();
  const currentLocation = usePathname();

  // Controla apertura menú hamburguesa (mobile)
  const [openMenu, setOpenMenu] = useState(false);
  // Controla si hay scroll para aplicar un gradient en el borde inferior
  const [scrolled, setScrolled] = useState(false);

  const username = user?.name || "";

  // Manejo de scroll => para que el header tenga sombra o gradient
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle menu hamburguesa
  const toggleMenu = () => {
    setOpenMenu((prev) => !prev);
  };

  // Logout
  const handleLogout = () => {
    logout();
  };

  // Clases condicionales para scroll
  const borderGradientClass = scrolled
    ? "border-b-4 border-transparent bg-gradient-to-b from-transparent to-secondary"
    : "border-b border-gray-200 dark:border-gray-700";

  // Para la animación de faBars
  // Si openMenu => rotate-90 (duración .3s => ease-in-out)
  const barsAnimationClass = openMenu ? "transform rotate-90" : "";

  return (
    <header
      className={`
        fixed top-0 left-0
        w-full
        z-40
        bg-white dark:bg-black
        ${borderGradientClass}
        shadow-sm
        transition-all
      `}
      style={{
        // Para escritorio dejamos espacio a la izquierda si usas sidebar
        // Sino, quita "md:ml-64" si no tienes sidebar
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      {/* PRIMERA FILA */}
      <div className="flex items-center justify-between px-4 py-3 md:py-4 md:px-8">
        {/* Izquierda => (mobile) Ícono hamburguesa + animación.
            (desktop) Logo "SmartMoneyGo" */}
        <div className="flex items-center">
          {/* MOBILE => Hamburguesa, se oculta en desktop */}
          <button
            onClick={toggleMenu}
            className={`
              md:hidden
              text-2xl text-black dark:text-white
              transition-transform duration-300
              ${barsAnimationClass}
            `}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          {/* DESKTOP => Logo, se oculta en mobile */}
          <Link
            href="/admin/dashboard"
            className="hidden md:inline-block text-3xl font-bold text-primary dark:text-white ml-0"
          >
            SmartMoneyGo
          </Link>
        </div>

        {/* CENTRO => (mobile) Nombre usuario, (desktop) Nombre usuario */}
        <div className="flex-1 flex justify-center md:justify-center">
          <span className="text-lg md:text-xl font-semibold text-black dark:text-white truncate">
            {username}
          </span>
        </div>

        {/* DERECHA => Dark Toggle + Botón salir */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <ThemeToggle />

          {/* Botón Salir */}
          <button
            onClick={handleLogout}
            className="
              flex items-center gap-1
              text-sm md:text-base
              bg-red-500 hover:bg-red-600
              text-white
              font-bold
              py-2 px-3
              rounded-md
            "
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Salir
          </button>
        </div>
      </div>

      {/* MENÚ HAMBURGUESA DESPLEGABLE (solo mobile) 
          => Empuja el contenido. 
          => Aquí con icon + texto, como dijiste. 
      */}
      {openMenu && (
        <div className="md:hidden px-4 pb-4">
          {/* Contenedor vertical de links con íconos + texto */}
          <nav className="flex flex-col space-y-2">
            {user.role !== "cobrador" && (
              <Link
                href="/admin/dashboard"
                className={`
                  flex items-center px-3 py-2 rounded
                  text-black dark:text-white
                  bg-gray-100 dark:bg-gray-800
                  ${
                    currentLocation === "/admin/dashboard"
                      ? "ring-2 ring-primary animate-float        /* Clase para la animación de flotación */"
                      : ""
                  }
                `}
              >
                <FontAwesomeIcon icon={faHome} className="mr-2" />
                Dashboard
              </Link>
            )}

            <Link
              href="/admin/clientes"
              className={`
                flex items-center px-3 py-2 rounded
                text-black dark:text-white
                bg-gray-100 dark:bg-gray-800
                ${
                  currentLocation === "/admin/clientes"
                    ? "ring-2 ring-primary animate-float        /* Clase para la animación de flotación */"
                    : ""
                }
              `}
            >
              <FontAwesomeIcon icon={faUsers} className="mr-2 " />
              Clientes
            </Link>

            <Link
              href="/admin/prestamos"
              className={`
                flex items-center px-3 py-2 rounded
                text-black dark:text-white
                bg-gray-100 dark:bg-gray-800
                ${
                  currentLocation === "/admin/prestamos"
                    ? "ring-2 ring-primary animate-float        /* Clase para la animación de flotación */ "
                    : ""
                }
              `}
            >
              <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
              Prestamos
            </Link>

            <Link
              href="/admin/pagos"
              className={`
                flex items-center px-3 py-2 rounded
                text-black dark:text-white
                bg-gray-100 dark:bg-gray-800
                ${
                  currentLocation === "/admin/pagos"
                    ? "ring-2 ring-primary animate-float        /* Clase para la animación de flotación */"
                    : ""
                }
              `}
            >
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-2" />
              Pagos
            </Link>

            <Link
              href="/admin/historial"
              className={`
                flex items-center px-3 py-2 rounded
                text-black dark:text-white
                bg-gray-100 dark:bg-gray-800
                ${
                  currentLocation === "/admin/historial"
                    ? "ring-2 ring-primary animate-float        /* Clase para la animación de flotación */"
                    : ""
                }
              `}
            >
              <FontAwesomeIcon icon={faHistory} className="mr-2" />
              Historial del Cliente
            </Link>

            {(user.role === "finanzas" || user.role === "administrador") && (
              <Link
                href="/admin/finanzas"
                className={`
                  flex items-center px-3 py-2 rounded
                  text-black dark:text-white
                  bg-gray-100 dark:bg-gray-800
                  ${
                    currentLocation === "/admin/finanzas"
                      ? "ring-2 ring-primary animate-float        /* Clase para la animación de flotación */"
                      : ""
                  }
                `}
              >
                <FontAwesomeIcon icon={faChartPie} className="mr-2" />
                Finanzas
              </Link>
            )}

            {user.role === "administrador" && (
              <Link
                href="/admin/users"
                className={`
                  flex items-center px-3 py-2 rounded
                  text-black dark:text-white
                  bg-gray-100 dark:bg-gray-800
                  ${
                    currentLocation === "/admin/users"
                      ? "ring-2 ring-primary animate-float        /* Clase para la animación de flotación */"
                      : ""
                  }
                `}
              >
                <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                Usuarios
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* SEGUNDA FILA DE ICONOS => En el enunciado dices 
         "actualmente está perfecto <768, 
          y para >=768 queremos verlos igual" 
         => Te doy un ejemplo que se muestra SIEMPRE. 
         Si NO quieres iconos en escritorio, pon "md:hidden". 
      */}
      <div className="px-4 pb-2 border-t border-gray-300 dark:border-gray-700">
        <div className="flex justify-around pt-2">
          {user.role !== "cobrador" && (
            <Link
              href="/admin/dashboard"
              className={`
                flex flex-col items-center hover:scale-300 transition-transform duration-300 hover:text-primary
                ${
                  currentLocation === "/admin/dashboard"
                    ? " animate-float text-primary  transform scale-200   "
                    : "text-black dark:text-gray-200"
                }
              `}
//transform
//transition-transform
//hover:scale-110

            >
              <FontAwesomeIcon icon={faHome} className="text-xl mb-1" />
            </Link>
          )}

          <Link
            href="/admin/clientes"
            className={`
              flex flex-col items-center hover:scale-300 transition-transform duration-300 hover:text-primary
              ${
                currentLocation === "/admin/clientes"
                  ? " animate-float text-primary  transform scale-200   "
                  : "text-black dark:text-gray-200"
              }
            `}
          >
            <FontAwesomeIcon icon={faUsers} className="text-xl mb-1" />
          </Link>

          <Link
            href="/admin/prestamos"
            className={`
              flex flex-col items-center hover:scale-300 transition-transform duration-300 hover:text-primary
              ${
                currentLocation === "/admin/prestamos"
                  ? " animate-float text-primary  transform scale-200   "
                  : "text-black dark:text-gray-200"
              }
            `}
          >
            <FontAwesomeIcon icon={faDollarSign} className="text-xl mb-1" />
          </Link>

          <Link
            href="/admin/pagos"
            className={`
              flex flex-col items-center hover:scale-300 transition-transform duration-300 hover:text-primary
              ${
                currentLocation === "/admin/pagos"
                  ? " animate-float text-primary  transform scale-200   "
                  : "text-black dark:text-gray-200"
              }
            `}
          >
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-xl mb-1" />
          </Link>

          <Link
            href="/admin/historial"
            className={`
              flex flex-col items-center hover:scale-300 transition-transform duration-300 hover:text-primary
              ${
                currentLocation === "/admin/historial"
                  ? " animate-float text-primary  transform scale-200   "
                  : "text-black dark:text-gray-200"
              }
            `}
          >
            <FontAwesomeIcon icon={faHistory} className="text-xl mb-1" />
          </Link>

          {(user.role === "finanzas" || user.role === "administrador") && (
            <Link
              href="/admin/finanzas"
              className={`
                flex flex-col items-center hover:scale-300 transition-transform duration-300 hover:text-primary
                ${
                  currentLocation === "/admin/finanzas"
                    ? " animate-float text-primary  transform scale-200   "
                    : "text-black dark:text-gray-200"
                }
              `}
            >
              <FontAwesomeIcon icon={faChartPie} className="text-xl mb-1" />
            </Link>
          )}

          {user.role === "administrador" && (
            <Link
              href="/admin/users"
              className={`
                flex flex-col items-center hover:scale-300 transition-transform duration-300 hover:text-primary
                ${
                  currentLocation === "/admin/users"
                    ? " animate-float text-primary  transform scale-200   "
                    : "text-black dark:text-gray-200"
                }
              `}
            >
              <FontAwesomeIcon icon={faUserShield} className="text-xl mb-1" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
