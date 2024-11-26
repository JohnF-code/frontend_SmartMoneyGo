// src/components/Chart.js
import React from 'react';
import { Line } from 'react-chartjs-2';

import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale);

const Chart = ({ netEarnings, grossEarnings, title }) => {

  console.log('MONTLY___', grossEarnings)

   const data = {
        type: 'line',
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

  return (
    <div className="bg-white p-4 shadow-sm rounded-lg flex-1">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <Line data={data} />
    </div>
  );
};

export default Chart;