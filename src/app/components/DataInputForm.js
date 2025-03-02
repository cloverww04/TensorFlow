import React, { useState } from 'react';
import Papa from 'papaparse';

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

    // Read and parse the CSV file
    Papa.parse(file, {
      complete: (result) => {
        if (result.errors.length > 0) {
          setError("Error parsing the CSV file.");
        } else {
          setError(null);
          setCsvData(result.data);
        }
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  // Handle form submission and pass parsed data to parent
  const handleSubmit = () => {
    if (csvData) {
      // Convert the parsed data
      const formattedData = csvData.map(row => ({
        date: row.DATE,
        temp: parseFloat(row.TEMP.trim()),
        station: row.STATION,
        latitude: row.LATITUDE,
        longitude: row.LONGITUDE,
        elevation: row.ELEVATION,
        name: row.NAME,
      }));

      // Pass the data to the parent component
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
