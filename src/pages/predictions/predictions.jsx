import React, { useState, useEffect } from "react";
import CitySearch from "../../components/Search/CitySearch";
import LoadingSpinner from "../../components/Spinners/LoadingSpinner";
import { fetchWeatherByCityId } from "../../utils/weatherApi";
import {
  generateForecast,
  getIconUrl,
  chunkForecast,
} from "../../utils/forecastUtils";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ScatterChart, Scatter, CartesianGrid, XAxis, YAxis } from "recharts";

const CACHE_LIFETIME = 7 * 24 * 60 * 60 * 1000;

const Predictions = () => {
  const [cityList, setCityList] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forecastPeriod, setForecastPeriod] = useState("weekly");
  const [lastCityId, setLastCityId] = useState("");
  const [weatherCounts, setWeatherCounts] = useState({});
  const [pieData, setPieData] = useState([]);
  const [dotData, setDotData] = useState([]);

  const weatherConditions = [
    "Clear",
    "Clouds",
    "Rain",
    "Snow",
    "Drizzle",
    "Thunderstorm",
    "Mist",
    "Smoke",
    "Haze",
    "Dust",
    "Fog",
    "Sand",
    "Ash",
    "Squall",
    "Tornado",
  ];

  useEffect(() => {
    const loadCityList = async () => {
      try {
        const res = await fetch("/city.list.json");
        const data = await res.json();
        const pakCities = data.filter((city) => city.country === "PK");
        setCityList(pakCities);

        navigator.geolocation?.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          const nearest = pakCities.reduce(
            (closest, city) => {
              const dist = Math.hypot(
                city.coord.lat - latitude,
                city.coord.lon - longitude
              );
              return dist < closest.dist ? { city, dist } : closest;
            },
            { city: null, dist: Infinity }
          );
          if (nearest.city) {
            setSelectedCityId(nearest.city.id.toString());
          }
        });
      } catch (error) {
        console.error("Failed to load city list", error);
      }
    };
    loadCityList();
  }, []);

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
      <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
        Weather Predictions
      </h2>

      {loading && <LoadingSpinner />}

      <div className="flex justify-between items-center my-4">
        <div>
          <CitySearch
            cities={cityList}
            selectedCityId={selectedCityId}
            setSelectedCityId={setSelectedCityId}
          />
        </div>

        <div className="flex gap-3">
          {["weekly", "monthly", "biMonthly"].map((period) => (
            <button
              key={period}
              className={`py-2 px-4 rounded-lg transition cursor-pointer ${
                forecastPeriod === period
                  ? "bg-blue-800 text-white shadow"
                  : "bg-blue-50 text-blue-800"
              }`}
              onClick={() => setForecastPeriod(period)}
              disabled={loading}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {weather && (
        <>
          <div className="flex items-center gap-4 mb-4 bg-blue-900 px-4 rounded-md text-white">
            <p className="text-xl font-semibold">
              Current Weather: {weather.current}
            </p>
            <img
              src={getIconUrl(weather.current)}
              alt={weather.current}
              className="w-12 h-12"
            />
          </div>

          <p className="text-lg font-semibold text-blue-900 capitalize mb-4">
            {forecastPeriod} Forecast (Pie Chart View)
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

          <p className="text-lg font-semibold text-blue-900 capitalize mb-4">
            {forecastPeriod} Forecast (Dot Graph View)
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
        </>
      )}
    </div>
  );
};

export default Predictions;
