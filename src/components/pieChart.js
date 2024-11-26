// src/components/PieChart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';

import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, ArcElement } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend, CategoryScale, ArcElement);

const PieChart = ({ capital }) => {
  const calculateTotalCapitalBySource = () => {
    return capital.reduce((acc, item) => {
        // Si el source ya está en el acumulador, suma el capital al total existente
        if (acc[item.source]) {
            acc[item.source] += item.capital;
        } else {
            // Si el source no está en el acumulador, inicializa el total con el capital actual
            acc[item.source] = item.capital;
        }
        return acc;
    }, {}); // El objeto vacío es el valor inicial del acumulador
  };
  const capitalBySource = calculateTotalCapitalBySource();
  console.log('CAPITAL BY SOURCE', capitalBySource)

  const data = {
    labels: Object.keys(capitalBySource),
    datasets: [
      {
        label: 'Inversionistas',
        data: Object.values(capitalBySource),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-4 shadow-sm rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Capital Invertido</h2>
      <Pie data={data} />
    </div>
  );
};

export default PieChart;