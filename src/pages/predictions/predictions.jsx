import React, { useState, useEffect } from "react";
import CitySearch from "../../components/Search/CitySearch";
import WeatherPredictions from "./WeatherPredictions";
import AqPrediction from "./AqPrediction";
import HumidityPredictions from "./humidityPrediction";
import TemperaturePrediction from "./temperaturePrediction";

function Predictions() {
  const [CityList, setCityList] = useState([]);
  const [lastCityId, setlastCityId] = useState(null);
  const [forecastPeriod, setforecastPeriod] = useState("weekly");
  const [selectedCityId, setselectedCityId] = useState(null);
  const [loading, setloading] = useState(false);
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
            setselectedCityId(nearest.city.id.toString());
          }
        });
      } catch (error) {
        console.error("Failed to load city list", error);
      }
    };
    loadCityList();
  }, []);
  return (
    <>
      <div className="flex justify-between items-center my-4 px-12 py-5">
        <div>
          <CitySearch
            cities={CityList}
            selectedCityId={selectedCityId}
            setSelectedCityId={setselectedCityId}
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
              onClick={() => setforecastPeriod(period)}
              disabled={loading}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <TemperaturePrediction
        forecastPeriod={forecastPeriod}
        lastCityId={lastCityId}
        loading={loading}
        setLoading={setloading}
        selectedCityId={selectedCityId}
        setLastCityId={setlastCityId}
      />
      <WeatherPredictions
        cityList={CityList}
        lastCityId={lastCityId}
        setLastCityId={setlastCityId}
        forecastPeriod={forecastPeriod}
        selectedCityId={selectedCityId}
        setSelectedCityId={setselectedCityId}
        setForecastPeriod={setforecastPeriod}
        loading={loading}
        setLoading={setloading}
      />
      <HumidityPredictions
        forecastPeriod={forecastPeriod}
        lastCityId={lastCityId}
        loading={loading}
        setLoading={setloading}
        selectedCityId={selectedCityId}
        setLastCityId={setlastCityId}
      />
      <AqPrediction
        forecastPeriod={forecastPeriod}
        lastCityId={lastCityId}
        loading={loading}
        setLoading={setloading}
        selectedCityId={selectedCityId}
        setLastCityId={setlastCityId}
      />
    </>
  );
}

export default Predictions;
