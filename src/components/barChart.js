import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Registrar los componentes de Chart.js que vamos a usar
ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
);

const BarChart = ({ data }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Actualizar el modo oscuro cuando la clase "dark" en el elemento raíz cambia
    useEffect(() => {
        const updateDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        // Configura un listener para detectar cambios en el modo oscuro
        const observer = new MutationObserver(updateDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // Comprobar el modo oscuro inicial
        updateDarkMode();

        // Limpieza del observer al desmontar el componente
        return () => observer.disconnect();
    }, []);

    // Obtener las etiquetas y los datos del gráfico
    const months = Object.keys(data);
    const loanCounts = Object.values(data);

    // Configuración del gráfico, que ahora depende de `isDarkMode`
    const chartData = {
        labels: months,
        datasets: [
            {
                label: `Número de Préstamos`,
                data: loanCounts,
                backgroundColor: 'rgba(143, 0, 214, 0.584)', // El color para el modo claro
                borderColor: '#540a7f',
                borderWidth: 1,

            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            labels: {
                color: isDarkMode ? '#ffffff' : '#000000', // Blanco en modo oscuro, negro en modo claro
            },
            },
            title: {
                display: true,
                text: 'Número de Préstamos por Mes',
                color: isDarkMode ? '#ffffff' : '#000000', // Blanco en modo oscuro, negro en modo claro
            },
        },
        scales: {
            y: {
                ticks: {
                    color: isDarkMode ? '#ffffff' : '#4b5563', // Blanco en modo oscuro, gris en modo claro
                },
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', // Líneas de cuadrícula en modo oscuro y claro
                },
            },
            x: {
                ticks: {
                    color: isDarkMode ? '#ffffff' : '#4b5563', // Blanco en modo oscuro, gris en modo claro
                },
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', // Líneas de cuadrícula en modo oscuro y claro
                },
            },
        },
    };



    return (
        <div className="bg-white p-4 shadow-sm rounded-lg flex-1 my-6 dark:bg-slate-900">
            <h2 className="text-lg font-semibold mb-4 text-black dark:text-white">Prestamos Creados Por Mes</h2>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default BarChart;