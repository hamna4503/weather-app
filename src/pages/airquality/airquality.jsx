import React, { useState, useEffect } from "react";
import CitySearch from "../../components/Search/CitySearch";
import LoadingSpinner from "../../components/Spinners/LoadingSpinner";
import { fetchAqiByCityId } from "../../utils/aqiApi"; 
import {
  generateAqiForecast,
  getAqiLevel,
  chunkAqiForecast,
} from "../../utils/aqiForcast";
import { motion, AnimatePresence } from "framer-motion";

const CACHE_LIFETIME = 7 * 24 * 60 * 60 * 1000;

const AirQualityReport = () => {
  const [cityList, setCityList] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [aqiData, setAqiData] = useState(null);
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
      fetchAirQuality();
    }
  }, [selectedCityId]);

  const fetchAirQualityFromCache = () => {
    const data = sessionStorage.getItem(`aqiData${selectedCityId}`);
    const time = sessionStorage.getItem(`aqiDataTime${selectedCityId}`);
    if (data && time && Date.now() - time < CACHE_LIFETIME) {
      return JSON.parse(data);
    }
    return null;
  };

  const saveAirQualityToCache = (data) => {
    sessionStorage.setItem(`aqiData${selectedCityId}`, JSON.stringify(data));
    sessionStorage.setItem(
      `aqiDataTime${selectedCityId}`,
      Date.now().toString()
    );
  };

  const fetchAirQuality = async () => {
    if (!selectedCityId || selectedCityId === lastCityId) return;

    setLoading(true);
    const cached = fetchAirQualityFromCache();
    if (cached) {
      setAqiData(cached);
      setLastCityId(selectedCityId);
      setLoading(false);
      return;
    }

    try {
      const res = await fetchAqiByCityId(selectedCityId); 
      const currentAqi = res.aqi; 
      const forecast = generateAqiForecast(currentAqi, 60);
      const aqiData = { currentAqi, forecast };
      setAqiData(aqiData);
      setLastCityId(selectedCityId);
      saveAirQualityToCache(aqiData);
    } catch (err) {
      alert("Could not fetch air quality data");
    }
    setLoading(false);
  };

  return (
    <div className="w-full mx-auto py-6 px-12">
      <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">
        Air Quality Report
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

      {aqiData && (
        <div>
          <div className="flex items-center gap-4 mb-4 bg-blue-900 px-4 py-4 rounded-md text-white">
            <p className="text-xl font-semibold">
              Current AQI: {getAqiLevel(aqiData.currentAqi).label}
            </p>
            <div
              className={`w-6 h-6 rounded-full ${
                getAqiLevel(aqiData.currentAqi).color
              }`}
            ></div>
          </div>

          <p className="text-lg font-semibold text-blue-900 capitalize mb-4">
            {forecastPeriod} Forecast
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={forecastPeriod + aqiData.currentAqi}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 overflow-x-auto pb-2"
            >
              {chunkAqiForecast(aqiData.forecast, 10)
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
                    {chunk.map((aqi, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col items-center p-4 rounded-lg shadow-md border ${
                          getAqiLevel(aqi).color
                        }`}
                      >
                        <span className="text-sm font-medium text-black-800 mb-1">
                          Day {rowIndex * 10 + idx + 1}
                        </span>
                        <div
                          className={`w-10 h-10 rounded-full ${
                            getAqiLevel(aqi).color
                          }`}
                        ></div>
                        <span className="mt-1 text-xs text-black">
                          {getAqiLevel(aqi).label}
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

export default AirQualityReport;
