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

const CACHE_LIFETIME = 7 * 24 * 60 * 60 * 1000;

const WeatherReport = () => {
  const [cityList, setCityList] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forecastPeriod, setForecastPeriod] = useState("weekly");
  const [lastCityId, setLastCityId] = useState("");

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
    const time = sessionStorage.getItem(`weatherDataTime${selectedCityId}`);
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
    sessionStorage.setItem(
      `weatherDataTime${selectedCityId}`,
      Date.now().toString()
    );
  };

  const fetchWeather = async () => {
    if (!selectedCityId || selectedCityId === lastCityId) return;

    setLoading(true);
    const cached = fetchWeatherFromCache();
    if (cached) {
      setWeather(cached);
      setLastCityId(selectedCityId);
      setLoading(false);
      return;
    }

    try {
      const res = await fetchWeatherByCityId(selectedCityId);
      const current = res.weather[0].main;
      const icon = res.weather[0].icon;
      const forecast = generateForecast(current, 60);
      const weatherData = { current, icon, forecast };
      setWeather(weatherData);
      setLastCityId(selectedCityId);
      saveWeatherToCache(weatherData);
    } catch (err) {
      alert("Could not fetch weather");
    }
    setLoading(false);
  };

  return (
    <div className="w-full mx-auto py-6 px-12">
      <h2 className="text-4xl font-extrabold text-blue-900 mb-8 text-center">
        Weather Report
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
        <div>
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
            {forecastPeriod} Forecast
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={forecastPeriod + weather.current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 overflow-x-auto pb-2"
            >
              {chunkForecast(weather.forecast, 10)
                .slice(
                  0,
                  forecastPeriod === "weekly"
                    ? 1
                    : forecastPeriod === "monthly"
                    ? 3
                    : 6
                )
                .map((chunk, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="grid grid-cols-10 gap-4 min-w-max"
                  >
                    {chunk.map((condition, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md border border-blue-100"
                      >
                        <span className="text-sm font-medium text-blue-800 mb-1">
                          Day {rowIndex * 10 + idx + 1}
                        </span>
                        <img
                          src={getIconUrl(condition)}
                          alt={condition}
                          className="w-10 h-10"
                        />
                        <span className="mt-1 text-xs text-blue-600">
                          {condition}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default WeatherReport;
