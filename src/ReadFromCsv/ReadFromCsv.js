import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import BatteryChart from './BatteryChart/BatteryChart';
import { Line ,Bar} from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';

const ReadFromCsv = () => {
    const [csvFiles, setCsvFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    // Fetch the list of CSV files directly from the 'Reports' folder
    const files = require.context('/public/Reports', false, /\.(csv)$/);
    const fileList = files.keys().map((file) => file.slice(2)); // Remove the './' prefix
    setCsvFiles(fileList);
  }, []);

const batteryChartData = csvData.slice(1, -1).map(entry => {
    return {
      time: entry[0],
      batteryPercent: entry[2]
    };
  });

  const bytesCombinedData = csvData.slice(1, -1).map(entry => ({
    time: entry[0],
    bytesSent: entry[5], // Assuming bytesSent is at index 5
    bytesReceived: entry[6], // Assuming bytesReceived is at index 6
  }));

 
  //Hungriest process/mem usage
  const aggregateData = data => {
    const aggregatedData = {};
    data.forEach(entry => {
      const label = entry[9];
      const value = entry[10];
  
      if (!aggregatedData[label]) {
        aggregatedData[label] = {
          totalMemory: 0,
          count: 0,
        };
      }
  
      aggregatedData[label].totalMemory += value;
      aggregatedData[label].count++;
    });
  
    // Calculate the average memory for each process
    const processedData = Object.keys(aggregatedData).map(label => ({
      label,
      value: aggregatedData[label].totalMemory / aggregatedData[label].count,
      count: aggregatedData[label].count
    }));
  
    return processedData;
  };
  const hungriestProcData = aggregateData(csvData.slice(1, -1));
  const sortedHungriestProcData = hungriestProcData.sort((a, b) => b.value - a.value);
  const HungriestProcessorChart = () => {
    const chartData = {
      labels: sortedHungriestProcData.map(entry => entry.label),
      datasets: [{
        label: 'Average Memory Usage',
        data: sortedHungriestProcData.map(entry => entry.value),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    };
  
    const chartOptions = {
      // Add any specific chart options here
    };
  
    return <Bar data={chartData} options={chartOptions} />;
  };
  

//hungriest process occ
const calculatePercentage = data => {
  const totalEntries = data.length;

  return data.map(entry => ({
    label: entry.label,
    percentage: totalEntries !== 0 ? (entry.count / totalEntries) * 100 : 0,
  }));
};

const OccurrencePercentageChart = () => {
  const percentageData = calculatePercentage(hungriestProcData);

  const chartData = {
    labels: percentageData.map(entry => `${entry.label} (${entry.percentage.toFixed(2)}%)`),
    datasets: [{
      data: percentageData.map(entry => entry.percentage),
      backgroundColor: [
        'red', 'blue', 'green', 'orange','pink','yellow','purple','aqua'
      ],
    }],
  };

  const chartOptions = {
    // Add any specific chart options here
  };

  return <Doughnut data={chartData} options={chartOptions} />;
};



const handleFileSelect = async () => {
    const filePath = `/datascience/Reports/${selectedFile}`;
  
    try {
      // Fetch the CSV file content
      const response = await fetch(filePath);
      const text = await response.text();
  
      // Use papaparse to parse CSV content
      Papa.parse(text, {
        dynamicTyping: true,
        complete: (result) => {
          // Set the parsed CSV data
          setCsvData(result.data);
          console.log('Parsed CSV Data:', result.data);
        },
      });
    } catch (error) {
      console.error('Error reading CSV file:', error);
    }
  };
  
  
  console.log(csvData)

  return (
    <div>
      <select onChange={(e) => setSelectedFile(e.target.value)} value={selectedFile}>
        <option value="">Select a CSV file</option>
        {csvFiles.map((file, index) => (
          <option key={index} value={file}>
            {file}
          </option>
        ))}
      </select>

      {selectedFile && (
        <button onClick={handleFileSelect}>view chart</button>
      )}

      {/* {csvData.length > 0 && (
        <div>
          <h2>Parsed CSV Data</h2>
          <pre>{JSON.stringify(csvData, null, 2)}</pre>
        </div>
      )} */}
      {csvData.length > 0 && (
        <>
  <div>
    <h2>Battery Percentage Over Time</h2>
    <Line
      data={{
        labels: batteryChartData.map(entry => entry.time),
        datasets: [{
          label: 'Battery Percentage',
          data: batteryChartData.map(entry => entry.batteryPercent),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        }],
      }}
    />
  </div>
  <div>
      <h2>Hungriest Processor</h2>
      <HungriestProcessorChart />
    </div>
    <div>
      <h2>Occurrence Percentage</h2>
      <OccurrencePercentageChart />
    </div>
    <div>
  <h2>Bytes Sent and Received Over Time</h2>
  <Line
    data={{
      labels: bytesCombinedData.map(entry => entry.time),
      datasets: [
        {
          label: 'Bytes Sent',
          data: bytesCombinedData.map(entry => entry.bytesSent),
          fill: false,
          borderColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
        {
          label: 'Bytes Received',
          data: bytesCombinedData.map(entry => entry.bytesReceived),
          fill: false,
          borderColor: 'rgba(192, 75, 192, 0.2)',
          tension: 0.1,
        },
      ],
    }}
  />
</div>
  </>
)}
    </div>
  );
};

export default ReadFromCsv;
