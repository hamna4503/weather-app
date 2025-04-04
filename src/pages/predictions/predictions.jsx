import React, { useState } from "react";
import { weatherData } from "../../data/weatherJson";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
} from "recharts";

function WeatherPredictor() {
  const [location, setLocation] = useState("Lahore");
  const [forecast, setForecast] = useState([]);

  // Function to simulate weather forecast based on Markov Chain
  const simulateMarkovForecast = (days) => {
    const transitionMatrix = weatherData.locations[location].transitions;
    let current = weatherData.locations[location].today.condition;

    const result = [];

    for (let i = 0; i < days; i++) {
      const transitions = transitionMatrix[current];
      const rand = Math.random();
      let sum = 0;

      for (const [next, prob] of Object.entries(transitions)) {
        sum += prob;
        if (rand <= sum) {
          current = next;
          break;
        }
      }

      result.push(current);
    }

    setForecast(result);
  };

  // Function to calculate frequency of weather conditions
  const getFrequencyData = () => {
    const conditionCounts = {
      Sunny: 0,
      Cloudy: 0,
      Rainy: 0,
    };

    forecast.forEach((condition) => {
      conditionCounts[condition]++;
    });

    return Object.keys(conditionCounts).map((key) => ({
      condition: key,
      count: conditionCounts[key],
    }));
  };

  // Function to structure the forecast data for day-wise display
  const getDayWiseData = () => {
    return forecast.map((condition, index) => ({
      day: `Day ${index + 1}`,
      condition,
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">
        Weather Forecast (Markov Simulation)
      </h1>

      <div className="flex gap-4 mb-4">
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="p-2 border rounded"
        >
          {Object.keys(weatherData.locations).map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <button
          onClick={() => simulateMarkovForecast(1)}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Simulate 1 Day
        </button>

        <button
          onClick={() => simulateMarkovForecast(7)}
          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Simulate 7 Days
        </button>

        <button
          onClick={() => simulateMarkovForecast(30)}
          className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Simulate 1 Month
        </button>
      </div>

      {forecast.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-4 mb-2">Forecast Summary</h2>
          {/* <ul className="list-disc ml-6 mb-4">
            {forecast.map((cond, index) => (
              <li key={index}>
                Day {index + 1}: {cond}
              </li>
            ))}
          </ul> */}

          <h2 className="text-xl font-semibold mt-4 mb-2">
            Forecast Distribution (Pie Chart)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getFrequencyData()}
                dataKey="count"
                nameKey="condition"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {getFrequencyData().map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#82ca9d" : "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <h2 className="text-xl font-semibold mt-8 mb-2">Day-wise Forecast</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getDayWiseData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis
                allowDataOverflow={true}
                type="category"
                dataKey="condition"
              />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="condition" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}

export default WeatherPredictor;
