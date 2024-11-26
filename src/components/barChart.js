import React from 'react';
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
    // Transformar los datos en formato que Chart.js puede usar
    const months = Object.keys(data);
    const loanCounts = Object.values(data);

    const chartData = {
        labels: months, // Meses
        datasets: [
            {
                label: 'Número de Préstamos',
                data: loanCounts, // Cantidad de préstamos
                backgroundColor: 'rgba(143, 0, 214, 0.584)', // Color de las barras
                borderColor: '#540a7f', // Color del borde de las barras
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Número de Préstamos por Mes',
            },
        },
    };

    return (
        <div className="bg-white p-4 shadow-sm rounded-lg flex-1 my-6">
            <h2 className="text-lg font-semibold mb-4">Prestamos Creados Por Mes</h2>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default BarChart;