"use client";

import Link from "next/link";
import { useAuth } from "@component/hooks/useAuth";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUsers,
  faDollarSign,
  faHistory,
  faFileInvoiceDollar,
  faUserShield,
  faChartPie,
  faRoad,        // Ícono para Rutas
  faUserTie      // Ícono para Cobradores
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar() {
  const { user, loading } = useAuth();
  const currentLocation = usePathname();

  if (loading || !user) {
    return (
      <aside className="hidden md:block w-64 bg-white shadow-md dark:bg-zinc-900">
        <div className="p-6">
          <h1 className="text-black text-2xl font-semibold dark:text-white">
            Cargando Sidebar...
          </h1>
        </div>
      </aside>
    );
  }

  const { role } = user;

  return (
    <aside
      className="
        mt-40
        hidden md:block
        fixed
        top-0
        left-6
        w-30
        h-[calc(75vh-10px)]
        bg-primary
        dark:bg-zinc-900
        shadow-2xl
        z-50
        rounded-l-[2rem]
        transform
        transition-transform
        hover:scale-110
        p-5
        overflow-hidden
      "
    >
      {/* Encabezado del sidebar */}
      

      {/* Menú principal */}
      <nav className="mt-0 space-y-1">
        {role !== "cobrador" && (
          <Link
            href="/admin/dashboard"
            className={`
              flex items-center py-1 px-5 transition duration-200
              hover:bg-secondary text-xl rounded-[0.5rem]
              ${currentLocation === "/admin/dashboard"
                ? "bg-white text-black animate-float"
                : "text-white"}
            `}
          >
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            Dashboard
          </Link>
        )}

        <Link
          href="/admin/clientes"
          className={`
            flex items-center py-1 px-5 transition duration-200
            hover:bg-secondary text-xl rounded-[0.5rem]
            ${currentLocation === "/admin/clientes"
              ? "bg-white text-black animate-float"
              : "text-white"}
          `}
        >
          <FontAwesomeIcon icon={faUsers} className="mr-2" />
          Clientes
        </Link>

        <Link
          href="/admin/prestamos"
          className={`
            flex items-center py-1 px-5 transition duration-200
            hover:bg-secondary text-xl rounded-[0.5rem]
            ${currentLocation === "/admin/prestamos"
              ? "bg-white text-black animate-float"
              : "text-white"}
          `}
        >
          <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
          Préstamos
        </Link>

        <Link
          href="/admin/historial"
          className={`
            flex items-center py-1 px-5 transition duration-200
            hover:bg-secondary text-xl rounded-[0.5rem]
            ${currentLocation === "/admin/historial"
              ? "bg-white text-black animate-float"
              : "text-white"}
          `}
        >
          <FontAwesomeIcon icon={faHistory} className="mr-2" />
          Historial
        </Link>

        <Link
          href="/admin/pagos"
          className={`
            flex items-center py-1 px-5 transition duration-200
            hover:bg-secondary text-xl rounded-[0.5rem]
            ${currentLocation === "/admin/pagos"
              ? "bg-white text-black animate-float"
              : "text-white"}
          `}
        >
          <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-2" />
          Pagos
        </Link>

        {(role === "finanzas" || role === "administrador") && (
          <Link
            href="/admin/finanzas"
            className={`
              flex items-center py-1 px-5 transition duration-200
              hover:bg-secondary text-xl rounded-[0.5rem]
              ${currentLocation === "/admin/finanzas"
                ? "bg-white text-black animate-float"
                : "text-white"}
            `}
          >
            <FontAwesomeIcon icon={faChartPie} className="mr-2" />
            Finanzas
          </Link>
        )}

        {role === "administrador" && (
          <>
            <Link
              href="/admin/users"
              className={`
                flex items-center py-1 px-5 transition duration-200
                hover:bg-secondary text-xl rounded-[0.5rem]
                ${currentLocation === "/admin/users"
                  ? "bg-white text-black animate-float"
                  : "text-white"}
              `}
            >
              <FontAwesomeIcon icon={faUserShield} className="mr-2" />
              Usuarios
            </Link>
            <Link
              href="/admin/rutas"
              className={`
                flex items-center py-1 px-5 transition duration-200
                hover:bg-secondary text-xl rounded-[0.5rem]
                ${currentLocation === "/admin/rutas"
                  ? "bg-white text-black animate-float"
                  : "text-white"}
              `}
            >
              <FontAwesomeIcon icon={faRoad} className="mr-2" />
              Rutas
            </Link>
            <Link
              href="/admin/cobradores"
              className={`
                flex items-center py-1 px-5 transition duration-200
                hover:bg-secondary text-xl rounded-[0.5rem]
                ${currentLocation === "/admin/cobradores"
                  ? "bg-white text-black animate-float"
                  : "text-white"}
              `}
            >
              <FontAwesomeIcon icon={faUserTie} className="mr-2" />
              Cobradores
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
