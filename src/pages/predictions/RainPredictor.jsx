import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const RainPredictor = ({ forecast, rainEvents }) => {
  // Get only the days when there will be rain
  const rainDays = forecast.map((condition, index) => ({
    day: `Day ${index + 1}`,
    rain: rainEvents.includes(index) ? "Rainy" : "No Rain",
  }));

  // Get the frequency of rain days
  const rainData = rainDays.filter((item) => item.rain === "Rainy");

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Rain Predictor</h2>
      <h3 className="mb-2">Rainy Days Forecast</h3>
      <ul className="list-disc ml-6 mb-4">
        {rainData.length > 0 ? (
          rainData.map((item, index) => (
            <li key={index}>Day {item.day}: Rainy</li>
          ))
        ) : (
          <li>No rain predicted in the forecast period.</li>
        )}
      </ul>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={rainData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="rain" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RainPredictor;
