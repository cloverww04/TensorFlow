import React, { useState } from 'react';
import Papa from 'papaparse'; // We use PapaParse for CSV parsing

const DataInputForm = ({ onDataSubmit }) => {
  const [csvData, setCsvData] = useState(null);
  const [error, setError] = useState(null);

  // Handle CSV file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError("No file selected.");
      return;
    }

    // Read and parse the CSV file using PapaParse
    Papa.parse(file, {
      complete: (result) => {
        if (result.errors.length > 0) {
          setError("Error parsing the CSV file.");
        } else {
          setError(null); // Clear any previous errors
          setCsvData(result.data); // Store parsed data in state
        }
      },
      header: true, // Treat the first row as headers
      skipEmptyLines: true, // Skip empty lines in the CSV
    });
  };

  // Handle form submission and pass parsed data to parent
  const handleSubmit = () => {
    if (csvData) {
      // Convert the parsed data into the format you want
      const formattedData = csvData.map(row => ({
        date: row.DATE,
        temp: parseFloat(row.TEMP.trim()), // Remove extra spaces and convert to number
        station: row.STATION,
        latitude: row.LATITUDE,
        longitude: row.LONGITUDE,
        elevation: row.ELEVATION,
        name: row.NAME,
      }));

      // Pass the data to the parent component (Home.js) for processing
      onDataSubmit(formattedData);
    } else {
      setError("No data to submit.");
    }
  };

  return (
    <div>
      <h3>Upload your CSV file</h3>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {csvData && (
        <div>
          {/* <pre>{JSON.stringify(csvData, 1, 1)}</pre> */}
          <button onClick={handleSubmit}>Submit Data</button>
        </div>
      )}
    </div>
  );
}; 

export default DataInputForm;
