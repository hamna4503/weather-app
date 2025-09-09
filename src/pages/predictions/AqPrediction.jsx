import React, { useState, useEffect } from "react";
import LoadingSpinner from "../../components/Spinners/LoadingSpinner";
import { fetchAqiByCityId } from "../../utils/aqiApi"; // assumed existing API utility
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

const CACHE_LIFETIME = 7 * 24 * 60 * 60 * 1000;

const AqiPredictions = ({
  selectedCityId,
  lastCityId,
  setLastCityId,
  loading,
  setLoading,
  forecastPeriod,
}) => {
  const [aqiData, setAqiData] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#FF0000",
    "#800080",
  ];

  const aqGraph = {
    1: { label: "Good", color: "bg-green-400" },
    2: { label: "Fair", color: "bg-yellow-400" },
    3: { label: "Moderate", color: "bg-orange-400" },
    4: { label: "Poor", color: "bg-red-500" },
    5: { label: "Very Poor", color: "bg-red-700" },
  };

  const returnAqValueForGraph = (aqVal) => {
    return aqGraph[aqVal]?.label || "Unknown";
  };

  useEffect(() => {
    if (selectedCityId && selectedCityId !== lastCityId) {
      fetchAqi();
    }
  }, [selectedCityId]);

  const fetchAqiFromCache = () => {
    const data = sessionStorage.getItem(`aqiData${selectedCityId}`);
    const time = sessionStorage.getItem(`aqiDataTime${selectedCityId}`);
    if (data && time && Date.now() - time < CACHE_LIFETIME) {
      return JSON.parse(data);
    }
    return null;
  };

  const saveAqiToCache = (data) => {
    sessionStorage.setItem(`aqiData${selectedCityId}`, JSON.stringify(data));
    sessionStorage.setItem(
      `aqiDataTime${selectedCityId}`,
      Date.now().toString()
    );
  };

  const fetchAqi = async () => {
    if (!selectedCityId || selectedCityId === lastCityId) return;

    setLoading(true);
    const cached = await fetchAqiFromCache();
    if (cached) {
      setAqiData(cached);
      setLoading(false);
      return;
    }

    try {
      const res = await fetchAqiByCityId(selectedCityId);
      setAqiData(res);
      setLastCityId(selectedCityId);
      saveAqiToCache(res);
    } catch (err) {
      alert("Could not fetch AQI data");
    }
    setLoading(false);
  };

  const forecastLength = {
    weekly: 7,
    monthly: 30,
    biMonthly: 60,
  }[forecastPeriod];

  const generateGraphData = async () => {
    if (aqiData) {
      const aqiValues = await aqiData.forecast?.slice(0, forecastLength);
      const tempData = {};
      await aqiValues.map((value) => {
        if (tempData[value]) {
          tempData[value] += 1;
        } else {
          tempData[value] = 1;
        }
      });

      const barFormatted = await aqiData.forecast
        ?.slice(0, forecastLength)
        .map((value, index) => ({
          name: returnAqValueForGraph(value),
          aqi: value,
          day: index + 1,
        }));
      setBarData(barFormatted);
    }
  };
  useEffect(() => {
    generateGraphData();
  }, [aqiData, forecastLength]);

  return (
    <div className="w-full mx-auto py-6 px-12">
      {loading && <LoadingSpinner />}

      {aqiData && (
        <>
          <div className="flex items-center gap-4 mb-4 bg-blue-900 px-4 rounded-md text-white"></div>
          <p className="text-lg font-semibold text-blue-900 capitalize mb-4">
            Air Quality Forecast Trend (Bar Graph)
          </p>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                label={{ value: "Day", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{
                  value: "AQI Value",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Bar dataKey="aqi" fill="#8884d8">
                {barData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.aqi}`}
                    fill={COLORS[entry.aqi % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default AqiPredictions;
