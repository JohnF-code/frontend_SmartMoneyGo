"use client";

import Sidebar from "@component/components/sidebar";
import Header from "@component/components/header";
import { useAuth } from "@component/hooks/useAuth";
import { useJsApiLoader } from "@react-google-maps/api";
import { redirect } from "next/navigation";

/**
 * AdminLayout:
 * - Sidebar fijo en desktop (con border-radius visible)
 * - Header fijo arriba, respetando el espacio del Sidebar
 * - Contenido principal con suficiente espacio debajo del Header
 */
export default function AdminLayout({ children }) {
  // Google Maps (si se usa)
  useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: process.env.NEXT_PUBLIC_LIBRARIES || [],
  });

  // Estado de autenticación
  const { user, loading } = useAuth();

  function Preloader() {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary" />
      </div>
    );
  }

  if (loading) return <Preloader />;
  if (!user) return redirect("/login");

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-800 mt">
      {/* Sidebar fijo */}
        <Sidebar />
      {/* Contenedor principal aqui */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Header */}
        <header
          className="fixed top-0 h-20 bg-white shadow-md z-40 flex items-center px-6"
          style={{
            left: "16rem", // Espacio reservado para el Sidebar
            right: "0", // Extiende hasta el borde derecho
          }}
        >
          <Header />
        </header>

        {/* Contenido principal */}
        <main
          className="flex-1 px-6 py-8 pt-14"
          style={{
            marginTop: "5rem", // Suficiente espacio debajo del Header
          }}
        >
          <div className="mt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
