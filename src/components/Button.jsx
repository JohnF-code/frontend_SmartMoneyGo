"use client";
import React from 'react';

// Reutilizable en toda la app
export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",  // 'primary', 'secondary', etc.
  className = "",
  disabled = false,
  ...props
}) {
  // Estilos base
  const baseStyles = `
    inline-flex
    items-center
    justify-center
    font-bold
    rounded-lg
    transition
    px-5
    py-2.5
    focus:outline-none
    disabled:opacity-50
  `;

  // Variantes
  const variants = {
    primary: `
      bg-primary
      text-white
      hover:bg-secondary
      hover:text-black
    `,
    secondary: `
      bg-secondary
      text-black
      hover:bg-primary
      hover:text-white
    `,
    // Si quieres un 'danger', etc. 
    // danger: 'bg-red-600 hover:bg-red-700 text-white' ...
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${selectedVariant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
