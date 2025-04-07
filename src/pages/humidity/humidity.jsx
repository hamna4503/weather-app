import React, { useState, useEffect } from "react";
import CitySearch from "../../components/Search/CitySearch";
import LoadingSpinner from "../../components/Spinners/LoadingSpinner";
import { fetchHumidityByCityId } from "../../utils/humidityApi";
import { generateHumidityForecast, chunkHumidityForecast } from "../../utils/humidityForecast";
import { motion, AnimatePresence } from "framer-motion";

const CACHE_LIFETIME = 7 * 24 * 60 * 60 * 1000;

const HumidityReport = () => {
  const [cityList, setCityList] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [humidityData, setHumidityData] = useState(null);
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
    sessionStorage.setItem(`humidityData${selectedCityId}`, JSON.stringify(data));
    sessionStorage.setItem(`humidityDataTime${selectedCityId}`, Date.now().toString());
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

  return (
    <div className="w-full mx-auto py-6 px-12">
      <h2 className="text-4xl font-extrabold text-blue-900 mb-8 text-center">
        Humidity Report
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

      {humidityData && (
        <div>
          <div className="flex items-center gap-4 mb-4 bg-blue-100 px-4 py-4 rounded-md text-blue-900">
            <p className="text-xl font-semibold">
              Current Humidity: {humidityData.currentHumidity}%
            </p>
          </div>

          <p className="text-lg font-semibold text-blue-900 capitalize mb-4">
            {forecastPeriod} Forecast
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={forecastPeriod + humidityData.currentHumidity}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 overflow-x-auto pb-2"
            >
              {chunkHumidityForecast(humidityData.forecast, 10)
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
                    {chunk.map((humidity, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center p-4 rounded-lg shadow-md border bg-white"
                      >
                        <span className="text-sm font-medium text-gray-700 mb-1">
                          Day {rowIndex * 10 + idx + 1}
                        </span>
                        <div className="w-10 h-10 bg-blue-300 rounded-full flex items-center justify-center text-blue-900 font-bold">
                          {humidity}%
                        </div>
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

export default HumidityReport;
