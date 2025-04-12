import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/Spinners/LoadingSpinner";
import { fetchAqiByCityId } from "../../utils/aqiApi";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Line,
} from "recharts";
import { Legend } from "chart.js";

const CACHE_LIFETIME = 7 * 24 * 60 * 60 * 1000;

const HumidityPredictions = ({
  selectedCityId,
  lastCityId,
  setLastCityId,
  loading,
  setLoading,
  forecastPeriod,
}) => {
  const [barData, setBarData] = useState([]);
  const [humidityData, setHumidityData] = useState(null);

  const COLORS = [
    "#4FC3F7",
    "#29B6F6",
    "#0288D1",
    "#81D4FA",
    "#26C6DA",
    "#00ACC1",
    "#B2EBF2",
    "#80DEEA",
  ];

  useEffect(() => {
    if (selectedCityId && selectedCityId !== lastCityId) {
      fetchHumidity();
    }
  }, [selectedCityId]);

  const fetchHumidityFromCache = () => {
    const data = sessionStorage.getItem(`humidityData${selectedCityId}`);
    const time = sessionStorage.getItem(`humidityDataTime${selectedCityId}`);
    if (data && time && Date.now() - time < CACHE_LIFETIME) {
      return JSON.parse(data);
    }
    return null;
  };

  const saveHumidityToCache = (data) => {
    sessionStorage.setItem(
      `humidityData${selectedCityId}`,
      JSON.stringify(data)
    );
    sessionStorage.setItem(
      `humidityDataTime${selectedCityId}`,
      Date.now().toString()
    );
  };

  const fetchHumidity = async () => {
    if (!selectedCityId || selectedCityId === lastCityId) return;
    setLoading(true);
    const cached = fetchHumidityFromCache();
    if (cached) {
      setHumidityData(cached);
      setLastCityId(selectedCityId);
      setLoading(false);
      return;
    }
    try {
      const res = await fetchHumidityByCityId(selectedCityId);
      const currentHumidity = res.humidity;
      const forecast = generateHumidityForecast(currentHumidity, 60);
      const humidityData = { currentHumidity, forecast };
      setHumidityData(humidityData);
      setLastCityId(selectedCityId);
      saveHumidityToCache(humidityData);
    } catch (err) {
      alert("Could not fetch humidity data");
    }
    setLoading(false);
  };

  const forecastLength = {
    weekly: 7,
    monthly: 30,
    biMonthly: 60,
  }[forecastPeriod];

  useEffect(() => {
    if (humidityData) {
      const barFormatted = humidityData.forecast
        ?.slice(0, forecastLength)
        .map((value, index) => ({
          humidity: value,
          day: index + 1,
        }));
      setBarData(barFormatted);
    }
  }, [humidityData, forecastLength]);

  return (
    <div className="w-full mx-auto py-6 px-12">
      {loading && <LoadingSpinner />}
      {humidityData && (
        <>
          <p className="text-lg font-semibold text-blue-900 capitalize mb-4">
            Humidity Forecast Trend (Composed Chart)
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                label={{ value: "Day", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{
                  value: "Humidity Percentage",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Bar dataKey="humidity">
                {barData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
              <Line type="monotone" dataKey="humidity" stroke="#8884d8" />
            </ComposedChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default HumidityPredictions;
