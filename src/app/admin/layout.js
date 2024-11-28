"use client";
import Sidebar from '@component/components/sidebar';
import Header from '@component/components/header';
import { useAuth } from '@component/hooks/useAuth';
import { redirect } from 'next/navigation';
import { useJsApiLoader } from '@react-google-maps/api';



export default function AdminLayout({ children }) {

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, // Utiliza una variable de entorno
    libraries: process.env.NEXT_PUBLIC_LIBRARIES,
  });

  const { user, loading } = useAuth();

  if(loading) return 'cargando...'

  document.querySelector('body').classList.add('bg-gray');
  

  return (
    <>
       
        {user?._id ? (
          <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col dark:bg-slate-700">
              <Header />
                <main className="lg:p-6 flex-1 dark:bg-slate-700">
                    {children}
                </main>
            </div>
          </div>
        ) : redirect('/login')}
        
    </>
  );
}