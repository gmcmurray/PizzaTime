import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Bar,Pie } from 'react-chartjs-2';
  import faker from 'faker';
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  
  export const options = {
    plugins: {
      title: {
        display: true,
        text: 'Kitchen Queue',
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };
  const labels = ['5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'];
  
  export const data = {
    labels,
    datasets: [
      {
        label: 'Active Orders',
        data: labels.map(() => faker.datatype.number({ min: 10, max: 30 })),
        backgroundColor: 'green',
      },
      {
        label: 'InOven',
        data: labels.map(() => faker.datatype.number({ min: 0, max: 20 })),
        backgroundColor: 'orange',
      },
      {
        label: 'Completed',
        data: labels.map(() => faker.datatype.number({ min: -10, max: 0 })),
        backgroundColor: 'cyan',
      },
    ],
  };
  
  export default function Chart() {
    return <Bar options={options} data={data} />;
  }