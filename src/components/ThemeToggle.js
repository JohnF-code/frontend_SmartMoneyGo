"use client"; 

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons"; 

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      setIsDark(true); 
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark"); 
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme); 
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="text-2xl p-2 transition-all duration-300 hover:text-gray-500 dark:hover:text-gray-300"
    >
      <FontAwesomeIcon 
        icon={isDark ? faSun : faMoon} 
        className={`transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'}`}
      />
    </button>
  );
};

export default ThemeToggle;
