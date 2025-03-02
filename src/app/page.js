'use client';

import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import DataInputForm from './components/DataInputForm';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';


// Register the necessary chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Home() {
  const [forecastResults, setForecastResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (parsedData) => {
    setLoading(true);
    if (parsedData) {
      console.log("Parsed Data:", parsedData);

      const temps = parsedData.map(item => parseFloat(item.temp));
      const dates = parsedData.map(item => item.date ? new Date(item.date).getTime() : 0);

      console.log("Cleaned Temperature Array:", temps);
      console.log("Cleaned Dates Array:", dates);

      runForecastingModel(dates, temps);
    }
  };

  const runForecastingModel = (dates, values) => {
    const normalizedDates = tf.tensor(dates).div(tf.scalar(1000 * 60 * 60 * 24)); // Normalize by days
    const minTemp = Math.min(...values);
    const maxTemp = Math.max(...values);

    const normalizedValues = tf.tensor(values).sub(minTemp).div(maxTemp - minTemp);
  
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 50, activation: 'relu', inputShape: [1] }));
    model.add(tf.layers.dense({ units: 1 }));
  
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
    });

    model.fit(normalizedDates, normalizedValues, {
      epochs: 100,
    }).then(() => {
      const lastTempValues = values.slice(values.length - 10); 
      const futureDates = [];
      const startDate = new Date(); 

      for (let i = 0; i < 10; i++) {
        const futureDate = new Date(startDate);
        futureDate.setDate(startDate.getDate() + i); 
        futureDates.push(futureDate.getTime());
      }

      const futureNormalizedDates = tf.tensor(futureDates).div(tf.scalar(1000 * 60 * 60 * 24));

      const predictions = model.predict(futureNormalizedDates);
      predictions.array().then((predictionsArray) => {
        const predictedData = predictionsArray.map((prediction, index) => ({
          date: new Date(futureDates[index]),
          value: prediction[0] * (maxTemp - minTemp) + minTemp, 
        }));

        setForecastResults(predictedData);
        setLoading(false);
      });
    });
  };

  // Chart.js Data for Line Chart Visualization
  const chartData = forecastResults && {
    labels: forecastResults.map(item => item.date.toDateString()),
    datasets: [
      {
        label: 'Predicted Temperature',
        data: forecastResults.map(item => item.value),
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
        backgroundColor: 'transparent'
      },
    ],
  };

  return (
    <div className="container">
      <h1>AI Time Series Forecasting Demo</h1>
      <DataInputForm onDataSubmit={handleSubmit} />

      {loading && <p>Loading predictions...</p>}

      {forecastResults && (
        <div>
          <h3>Predicted Data</h3>
          
          {/* Data Table */}
          <div className="table-container">
            <table className="forecast-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Predicted Temp (°F)</th>
                </tr>
              </thead>
              <tbody>
                {forecastResults.map((result, index) => (
                  <tr key={index}>
                    <td>{result.date.toDateString()}</td>
                    <td>{result.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Graph Chart */}
          <div className="chart-container">
            <Line data={chartData} />
          </div>
        </div>
      )}
    </div>
  );
}
