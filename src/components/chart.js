// src/components/Chart.js
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const Chart = ({ netEarnings, grossEarnings, title }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const updateDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        const observer = new MutationObserver(updateDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        updateDarkMode();

        return () => observer.disconnect();
    }, []);

    const data = {
        labels: grossEarnings.map(pago => `${pago.month || pago.dayOfWeek}`),
        datasets: [
            {
                label: 'Ganancias brutas',
                data: grossEarnings.map(pago => pago.grossEarnings),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 4,
            },
            {
                label: 'Ganancias netas',
                data: netEarnings.map(pago => pago.netEarnings),
                backgroundColor: 'rgba(255, 153, 0, 0.2)',
                borderColor: '#ffb300',
                borderWidth: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: isDarkMode ? '#ffffff' : '#000000',
                },
            },
            title: {
                display: true,
                text: title,
                color: isDarkMode ? '#ffffff' : '#000000',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: isDarkMode ? '#ffffff' : '#4b5563',
                },
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                },
            },
            x: {
                ticks: {
                    color: isDarkMode ? '#ffffff' : '#4b5563',
                },
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                },
            },
        },
    };

    return (
        <div className="bg-white p-4 shadow-sm rounded-lg flex-1 my-6 dark:bg-slate-900">
            <h2 className="text-lg font-semibold mb-4 text-black dark:text-white">{title}</h2>
            <Line data={data} options={options} />
        </div>
    );
};

export default Chart;
