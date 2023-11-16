import React, { useState, useEffect,useRef } from 'react';
import Papa from 'papaparse';
import BatteryChart from './BatteryChart/BatteryChart';
import { Line ,Bar} from 'react-chartjs-2';
import { Doughnut } from 'react-chartjs-2';
import { useReactToPrint } from 'react-to-print';
import './ReadFromCsv.css'
import { BsCloudDownload } from "react-icons/bs";
import { AiOutlineCloseCircle } from "react-icons/ai";


const ReadFromCsv = () => {
  const [csvFiles, setCsvFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [csvData, setCsvData] = useState([]);
  const componentRef = useRef();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  useEffect(() => {
    // Fetch the list of CSV files directly from the 'Reports' folder
    const files = require.context('/public/Reports', false, /\.(csv)$/);
    const fileList = files.keys().map((file) => file.slice(2)); // Remove the './' prefix
    setCsvFiles(fileList);
  }, []);

const batteryChartData = csvData.slice(1, -1).map(entry => {
    return {
      time: new Date(entry[0] * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      batteryPercent: entry[2]
    };
  });

  const bytesCombinedData = csvData.slice(1, -1).map(entry => ({
    time: new Date(entry[0] * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        borderColor:'blue',
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
  const totalEntries = data.reduce((sum, entry) => sum + entry.count, 0);

  return data.map(entry => ({
    label: entry.label,
    percentage: totalEntries !== 0 ? (entry.count / totalEntries) * 100 : 0,
  }));
};

const OccurrencePercentageChart = () => {
  const percentageData = calculatePercentage(hungriestProcData);

  // Normalize percentages to ensure the sum is 100%
  const normalizedPercentageData = percentageData.map(entry => ({
    label: entry.label,
    percentage: (entry.percentage / 100) * 100,
  }));

  const chartData = {
    labels: normalizedPercentageData.map(entry => `${entry.label} (${entry.percentage.toFixed(2)}%)`),
    datasets: [{
      data: normalizedPercentageData.map(entry => entry.percentage),
      backgroundColor: [
        'red', 'blue', 'green', 'orange', 'pink', 'yellow', 'purple', 'aqua'
      ],
    }],
  };

  const chartOptions = {
    // Add any specific chart options here
  };

  return <Doughnut data={chartData} options={chartOptions} />;
};


  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });



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
  useEffect(() => {
    // Trigger visualization when a file is selected
    if (selectedFile) {
      handleFileSelect();
    }
  }, [selectedFile]); 
  
  console.log(csvData)
  // Calculate average battery percentage
  const convertToNumber = value => (isNaN(value) ? 0 : parseFloat(value));

  const averageBatteryPercent = csvData.length > 1
    ? csvData.slice(1).reduce((sum, entry) => sum + convertToNumber(entry[2]), 0) / (csvData.length - 1)
    : 0;
  
  const averageBytesSent = csvData.length > 1
    ? csvData.slice(1).reduce((sum, entry) => sum + convertToNumber(entry[5]), 0) / (csvData.length - 1)
    : 0;
  
  const averageBytesReceived = csvData.length > 1
    ? csvData.slice(1).reduce((sum, entry) => sum + convertToNumber(entry[6]), 0) / (csvData.length - 1)
    : 0;
  
  const averageRunningProcessor = csvData.length > 1
    ? csvData.slice(1).reduce((sum, entry) => sum + convertToNumber(entry[7]), 0) / (csvData.length - 1)
    : 0;
  

  return (
    <div>
      <select className="select" onChange={(e) => setSelectedFile(e.target.value)} value={selectedFile}>
        <option value="">Select a CSV file</option>
        {csvFiles.map((file, index) => (
          <option key={index} value={file}>
            {file}
          </option>
        ))}
      </select>

    {selectedFile && (
          <button className='save' onClick={togglePopup}>Numeric Report</button>
          )}
      
      {isPopupOpen && (
        <div className='popup'>
          {/* <div className='close_cont' >
           <AiOutlineCloseCircle className='close' onClick={togglePopup}/>
           </div> */}
          <div className='popupContent'>
          <p>Average Battery Percentage: {averageBatteryPercent}</p>
          <p>Average Bytes Sent: {averageBytesSent}</p>
          <p>Average Bytes Received: {averageBytesReceived}</p>
          <p>Average Running Processor: {averageRunningProcessor}</p>
          <button className='close' onClick={togglePopup}>Close</button>
          </div>
        </div>
      )}

      {/* {selectedFile && (
        <button className='view' onClick={handleFileSelect}>Visualize</button>
      )} */}

{csvData.length > 0 && (
    <div>
     
      <button className='save' onClick={handlePrint}>
      <BsCloudDownload className='icon'/>
      Save as PDF</button>
    </div>
)}

      {/* {csvData.length > 0 && (
        <div>
          <h2>Parsed CSV Data</h2>
          <pre>{JSON.stringify(csvData, null, 2)}</pre>
        </div>
      )} */}
     <div ref={componentRef}>
      {csvData.length > 0 && (
        <div className='chart_container'>
  <div className='chart'>
    <h2>Battery Percentage Over Time</h2>
    <Line
      data={{
        labels: batteryChartData.map(entry => entry.time),
        datasets: [{
          label: 'Battery Percentage',
          data: batteryChartData.map(entry => entry.batteryPercent),
          fill: true,
          borderColor:'blue',
          tension: 0.1,
        }],
      }}
    />
  </div>
  <div  className='chart'>
      <h2>Hungriest Process</h2>
      <HungriestProcessorChart />
    </div>
    <div className='Dchart'>
      <h2>Process Occurrence</h2>
      <OccurrencePercentageChart />
    </div>
    <div className='chart'>
  <h2>Bytes Sent and Received Over Time</h2>
  <Line
    data={{
      labels: bytesCombinedData.map(entry => entry.time),
      datasets: [
        {
          label: 'Bytes Sent',
          data: bytesCombinedData.map(entry => entry.bytesSent),
          fill: false,
          borderColor: 'blue',
          tension:0.1,
        },
        {
          label: 'Bytes Received',
          data: bytesCombinedData.map(entry => entry.bytesReceived),
          fill: false,
          borderColor: 'red',
          tension: 0.1,
        },
      ],
    }}
  />
</div>
  </div>
)}
</div>

    </div>
  );
};

export default ReadFromCsv;
