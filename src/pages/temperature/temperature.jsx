import React, { useState, useEffect } from "react";
import { fetchWeatherData } from "../../utils/weatherData";
import CitySearch from "../../components/Search/CitySearch";
import LoadingSpinner from "../../components/Spinners/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

const CACHE_LIFETIME = 7 * 24 * 60 * 60 * 1000;

const Temperature = () => {
    const [cityList, setCityList] = useState([]);
    const [selectedCityId, setSelectedCityId] = useState("");
    const [temperatureData, setTemperatureData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastCityId, setLastCityId] = useState("");
    const [forecastPeriod, setForecastPeriod] = useState("weekly");

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

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="w-full mx-auto py-6 px-12">
            <h2 className="text-4xl font-extrabold text-blue-900 mb-8 text-center">
                Temperature Report
            </h2>

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
                            className={`py-2 px-4 rounded-lg transition cursor-pointer ${forecastPeriod === period
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

            {temperatureData && (
                <div>
                    <div className="flex justify-between items-center bg-gradient-to-b from-blue-100 to-blue-50 px-6 py-6 rounded-2xl shadow-md">
                        <div>
                            <p className="text-sm text-gray-700 font-medium mb-1">Now</p>
                            <div className="flex items-center gap-2">
                                <p className="text-6xl font-bold text-gray-900">
                                    {temperatureData.temperature}°
                                </p>
                                <img
                                    src={`https://openweathermap.org/img/wn/${temperatureData.icon}@2x.png`}
                                    alt="weather icon"
                                    className="w-12 h-12"
                                />
                            </div>
                            <p className="text-sm text-gray-700 font-medium mt-1">
                                Feels like {temperatureData.feels_like}°
                            </p>
                        </div>

                    </div>

                    <p className="mt-4 text-lg font-semibold text-blue-900 capitalize mb-4">
                        {forecastPeriod} Forecast
                    </p>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={forecastPeriod + temperatureData.temperature}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4"
                        >
                            {temperatureData.forecast
                                .slice(
                                    0,
                                    forecastPeriod === "weekly"
                                        ? 7
                                        : forecastPeriod === "monthly"
                                            ? 30
                                            : 60
                                )
                                .map((day, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white border border-blue-200 shadow rounded-2xl p-3 flex flex-col items-center justify-between aspect-square"
                                    >
                                        <p className="text-sm text-blue-800 font-medium text-center">
                                            {new Date(day.date).toLocaleDateString(undefined, {
                                                weekday: "short",
                                                day: "numeric",
                                                month: "short",
                                            })}
                                        </p>
                                        <img
                                            src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                                            alt="forecast icon"
                                            className="w-12 h-12 my-2"
                                        />
                                        <p className="text-lg font-semibold text-blue-900">{day.temp}°</p>
                                    </div>
                                ))}
                        </motion.div>
                    </AnimatePresence>

                </div>
            )}
        </div>
    );
};

export default Temperature;
