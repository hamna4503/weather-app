import React, { useState, useEffect } from "react";
import CitySearch from "../../components/Search/CitySearch";
import LoadingSpinner from "../../components/Spinners/LoadingSpinner";
import { fetchWeatherByCityId } from "../../utils/weatherApi";
import { generateForecast, getIconUrl } from "../../utils/forecastUtils";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ScatterChart, Scatter, CartesianGrid, XAxis, YAxis } from "recharts";

const CACHE_LIFETIME = 7 * 24 * 60 * 60 * 1000;

const WeatherPredictions = ({
  selectedCityId,
  lastCityId,
  setLastCityId,
  forecastPeriod,
  loading,
  setLoading,
}) => {
  const [weather, setWeather] = useState(null);
  const [weatherCounts, setWeatherCounts] = useState({});
  const [pieData, setPieData] = useState([]);
  const [dotData, setDotData] = useState([]);

  useEffect(() => {
    if (selectedCityId && selectedCityId !== lastCityId) {
      fetchWeather();
    }
  }, [selectedCityId]);

  const fetchWeatherFromCache = () => {
    const data = sessionStorage.getItem(`weatherData${selectedCityId}`);
    const time = sessionStorage.getItem("weatherDataTime");
    if (data && time && Date.now() - time < CACHE_LIFETIME) {
      return JSON.parse(data);
    }
    return null;
  };

  const saveWeatherToCache = (data) => {
    sessionStorage.setItem(
      `weatherData${selectedCityId}`,
      JSON.stringify(data)
    );
    sessionStorage.setItem("weatherDataTime", Date.now().toString());
  };

  const fetchWeather = async () => {
    if (!selectedCityId || selectedCityId === lastCityId) return;

    setLoading(true);
    const cached = await fetchWeatherFromCache();
    if (cached) {
      setWeather(cached);
      setLoading(false);
      return;
    }

    try {
      const res = await fetchWeatherByCityId(selectedCityId);
      const current = res.weather[0].main;
      const icon = res.weather[0].icon;
      const forecast = generateForecast(current);
      const weatherData = { current, icon, forecast };
      setWeather(weatherData);
      setLastCityId(selectedCityId);
      saveWeatherToCache(weatherData);
    } catch (err) {
      alert("Could not fetch weather");
    }
    setLoading(false);
  };

  const forecastLength = {
    weekly: 7,
    monthly: 30,
    biMonthly: 60,
  }[forecastPeriod];

  useEffect(() => {
    if (weather) {
      const counts = weather.forecast
        ?.slice(0, forecastLength)
        .reduce((acc, condition) => {
          acc[condition] = (acc[condition] || 0) + 1;
          return acc;
        }, {});
      setWeatherCounts(counts);

      const data = Object.entries(counts).map(([condition, count]) => ({
        name: condition,
        value: count,
      }));
      setPieData(data);

      // Create dot data for the graph
      const dots = weather.forecast
        .slice(0, forecastLength)
        .map((condition, index) => ({
          index: index + 1,
          condition,
        }));
      setDotData(dots);
    }
  }, [weather, forecastLength]);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#FF0000",
    "#800080",
    "#8B4513",
    "#2F4F4F",
    "#556B2F",
    "#FFD700",
    "#A52A2A",
    "#B0C4DE",
    "#DC143C",
    "#ADFF2F",
    "#FF69B4",
  ];

  return (
    <div className="w-full mx-auto py-6 px-12">
      {/* <h2 className="text-4xl font-extrabold text-blue-900 mb-8 text-center">
        Weather Graphs
      </h2> */}

      {loading && <LoadingSpinner />}

      {weather && (
        <>
          <p className="text-lg font-semibold text-blue-900 capitalize mb-4">
            Weather {forecastPeriod} Forecast (Dot Graph View)
          </p>

          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="index"
                name="Day"
                label={{ value: "Day", position: "insideBottom", offset: -5 }}
                tickFormatter={(tick) => `Day ${tick}`}
              />
              <YAxis
                type="category"
                dataKey="condition"
                name="Condition"
                allowDuplicatedCategory={false}
                label={{ value: "Weather", angle: -90, position: "insideLeft" }}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter
                name="Forecast"
                data={dotData}
                fill="#8884d8"
                shape="circle"
              >
                {dotData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.condition] || "#8884d8"}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          <p className="text-lg font-semibold text-blue-900 capitalize mb-4">
            Weather {forecastPeriod} Forecast (Pie Chart View)
          </p>

          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                fill="#8884d8"
                label
              >
                {pieData?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default WeatherPredictions;
