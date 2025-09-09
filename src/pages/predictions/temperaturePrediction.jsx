import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/Spinners/LoadingSpinner";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchWeatherData } from "../../utils/weatherData";

const CACHE_LIFETIME = 7 * 24 * 60 * 60 * 1000; // 7 days

const TemperaturePrediction = ({
  selectedCityId,
  lastCityId,
  setLastCityId,
  loading,
  setLoading,
  forecastPeriod,
}) => {
  const [barData, setBarData] = useState([]);
  const [temperatureData, setTemperatureData] = useState(null);

  const fetchWeatherFromCache = (cityId) => {
    const data = sessionStorage.getItem(`weatherData_${cityId}`);
    const time = sessionStorage.getItem(`weatherDataTime_${cityId}`);
    if (data && time && Date.now() - Number(time) < CACHE_LIFETIME) {
      return JSON.parse(data);
    }
    return null;
  };

  const saveWeatherToCache = (cityId, data) => {
    sessionStorage.setItem(`weatherData_${cityId}`, JSON.stringify(data));
    sessionStorage.setItem(`weatherDataTime_${cityId}`, Date.now().toString());
  };

  const fetchWeather = async () => {
    if (!selectedCityId || selectedCityId === lastCityId) return;

    setLoading(true);

    const cached = fetchWeatherFromCache(selectedCityId);
    if (cached) {
      setTemperatureData(cached);
      setLastCityId(selectedCityId);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchWeatherData(selectedCityId);
      setTemperatureData(data);
      setLastCityId(selectedCityId);
      saveWeatherToCache(selectedCityId, data);
    } catch (err) {
      alert("Could not fetch weather data");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (selectedCityId && selectedCityId !== lastCityId) {
      fetchWeather();
    }
  }, [selectedCityId]);

  const forecastLength = {
    weekly: 7,
    monthly: 30,
    biMonthly: 60,
  }[forecastPeriod];

  useEffect(() => {
    if (temperatureData) {
      const barFormatted = temperatureData.forecast
        ?.slice(0, forecastLength)
        .map((value, index) => ({
          day: index + 1,
          temperature: value.temp,
        }));
      setBarData(barFormatted);
    }
  }, [temperatureData, forecastLength]);

  return (
    <div className="w-full mx-auto py-6 px-12">
      {loading && <LoadingSpinner />}
      {temperatureData && (
        <>
          <p className="text-lg font-semibold text-blue-900 capitalize mb-4">
            Temperature Forecast (Line Chart)
          </p>

          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#ff7300"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default TemperaturePrediction;
