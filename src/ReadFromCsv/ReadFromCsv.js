import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import BatteryChart from './BatteryChart/BatteryChart';
import { Line } from 'react-chartjs-2';

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
  const batteryChartData=[
    
        { time: 1699513358, batteryPercent: 45 },
        { time: 1699513379, batteryPercent: 42 },
        { time: 1699513579, batteryPercent: 50 },
        { time: 1699513398, batteryPercent: 20 },
        { time: 1699513355, batteryPercent: 60 },
        { time: 1699513358, batteryPercent: 40 },
        { time: 1699513355, batteryPercent: 20 },
        { time: 1699513355, batteryPercent: 60 },
        { time: 1699513325, batteryPercent: 20 },
        { time: 1699513356, batteryPercent: 85 },
        // ... other data
      
  ]
// const batteryChartData = csvData
//   .map(entry => {
//     if (entry && typeof entry === 'object' && 'time' in entry && 'batteryPercent' in entry) {
//       return {
//         time: entry.time,
//         batteryPercent: entry.batteryPercent,
//       };
//     } else {
//       console.error('Invalid entry:', entry);
//       return null; // or handle it as you see fit
//     }
//   })
//   .filter(Boolean);
// console.log(batteryChartData)
  

  const handleFileSelect = async () => {
    const filePath = `/Reports/${selectedFile}`;

    try {
      // Fetch the CSV file content
      const response = await fetch(filePath);
      const text = await response.text();

      // Use papaparse to parse CSV content
      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          // Set the parsed CSV data
          setCsvData(result.data);
          const batteryChartData = result.data.map((entry) => ({
            time: entry.time,
            batteryPercent: entry.batteryPercent,
          }));
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
)}
    </div>
  );
};

export default ReadFromCsv;
