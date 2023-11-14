import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import moment from 'moment';
import { DateTime } from 'luxon'; // Import DateTime from luxon

Chart.register(...registerables);

const BatteryChart = ({ data }) => {
  // Extracting data
  const timeData = data.map(entry => entry.time ? DateTime.fromSeconds(entry.time).toJSDate() : null);
  const batteryPercent = data.map(entry => entry.time !== null ? entry.batteryPercent : null);

  const chartData = {
    labels: timeData,
    datasets: [
      {
        label: 'Battery Percentage',
        data: batteryPercent,
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'time',
        position: 'bottom',
        time: {
          unit: 'day',
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default BatteryChart;
