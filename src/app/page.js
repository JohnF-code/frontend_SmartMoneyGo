"use client";
import { useAuth } from "@component/hooks/useAuth";
import { redirect } from 'next/navigation'

export default function Page() {
  const { user, loading } = useAuth();

  if (loading) return 'cargando...'
  
  document.querySelector('body').classList.add('bg-gray');

  return (
    <>
      {user?._id ? redirect('/admin/dashboard') : redirect('/login')}
    </>
  );
}
