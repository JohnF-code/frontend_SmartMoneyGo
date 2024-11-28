import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const GraficaDePagos = ({ pagosPorMes, impagos }) => {
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

    const data = {
        type: 'line',
        labels: pagosPorMes.map(pago => `${pago.year}-${String(pago.month).padStart(2, '0')}`),
        datasets: [
            {
                label: 'Monto de Pagos',
                data: pagosPorMes.map(pago => pago.total),
                backgroundColor: isDarkMode ? 'rgba(75, 192, 192, 0.2)' : 'rgba(75, 192, 192, 0.2)', // Color de fondo
                borderColor: isDarkMode ? 'rgba(75, 192, 192, 1)' : 'rgba(75, 192, 192, 1)', // Color del borde
                borderWidth: 4,
            },
            {
                label: 'Monto de Impagos',
                data: impagos.map(pago => pago.total),
                backgroundColor: isDarkMode ? 'rgba(224, 44, 98, 0.2)' : 'rgba(224, 44, 98, 0.2)', // Color de fondo
                borderColor: isDarkMode ? '#e02c62' : '#e02c62', // Color del borde
                borderWidth: 4,
            }
        ],
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: isDarkMode ? '#ffffff' : '#000000', // Color de las etiquetas de la leyenda
                    },
                },
                title: {
                    display: true,
                    text: 'Monto de Pagos vs Impagos',
                    color: isDarkMode ? '#ffffff' : '#000000', // Color del título
                },
            },
            scales: {
                y: {
                    ticks: {
                        color: isDarkMode ? '#ffffff' : '#4b5563', // Color de las etiquetas del eje Y
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', // Color de las líneas de la cuadrícula en el eje Y
                    },
                },
                x: {
                    ticks: {
                        color: isDarkMode ? '#ffffff' : '#4b5563', // Color de las etiquetas del eje X
                    },
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', // Color de las líneas de la cuadrícula en el eje X
                    },
                },
            },
        },
    };

    return (
        <div className="bg-white p-4 shadow-sm rounded-lg flex-1 my-6 dark:bg-slate-900">
            <h2 className="text-lg font-semibold mb-4 text-black dark:text-white">Gráfica de Pagos y Impagos</h2>
            <Line data={data} options={data.options} />
        </div>
    );
};

export default GraficaDePagos;
