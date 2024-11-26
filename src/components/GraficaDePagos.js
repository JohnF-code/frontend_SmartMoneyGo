import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const GraficaDePagos = ({ pagosPorMes, impagos }) => {
    
    const data = {
        type: 'line',
        labels: pagosPorMes.map(pago => `${pago.year}-${String(pago.month).padStart(2, '0')}`),
        datasets: [
            {
                label: 'Monto de Pagos',
                data: pagosPorMes.map(pago => pago.total),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 4,
            },
            {
                label: 'Monto de Impagos',
                data: impagos.map(pago => pago.total),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: '#e02c62',
                borderWidth: 4,
            }
        ],
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    }

    return <Line data={data} />;
};

export default GraficaDePagos;