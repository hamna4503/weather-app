import axios from "axios";
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
let cityList = null;


const loadCityList = async () => {
  if (!cityList) {
    const res = await fetch("/city.list.json");
    cityList = await res.json();
  }
  return cityList;
};

export const fetchWeatherData = async (cityId) => {
  const cities = await loadCityList();
  const city = cities.find((c) => c.id.toString() === cityId.toString());

  if (!city) throw new Error("City not found");

  const { lat, lon } = city.coord;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  const response = await axios.get(url);
  const data = response.data;

  return {
    temperature: Math.round(data.main.temp),
    feels_like: Math.round(data.main.feels_like),
    condition: data.weather[0].description,
    icon: data.weather[0].icon,
    forecast: generateTemperatureForecast(Math.round(data.main.temp), 60),
  };
};

const generateTemperatureMarkovMatrix = (currentTemp) => {
  const matrix = {
    10: { 10: 0.5, 15: 0.3, 20: 0.2 },
    15: { 10: 0.2, 15: 0.5, 20: 0.3 },
    20: { 15: 0.2, 20: 0.5, 25: 0.3 },
    25: { 20: 0.2, 25: 0.4, 30: 0.4 },
    30: { 25: 0.2, 30: 0.5, 35: 0.3 },
    35: { 30: 0.2, 35: 0.5, 40: 0.3 },
    40: { 35: 0.3, 40: 0.5, 45: 0.2 },
  };

  const key = Math.round(currentTemp / 5) * 5;
  return matrix[key] || matrix[25]; // fallback to 25°C
};

const getNextNumericTemp = (currentTemp) => {
  const matrix = generateTemperatureMarkovMatrix(currentTemp);
  const rand = Math.random();
  let sum = 0;
  for (const [temp, prob] of Object.entries(matrix)) {
    sum += prob;
    if (rand <= sum) return parseInt(temp);
  }
  return currentTemp; // fallback
};

const pickRandomWeatherIcon = () => {
  const icons = ["01d", "02d", "03d", "04d", "09d", "10d", "11d", "13d", "50d"];
  return icons[Math.floor(Math.random() * icons.length)];
};


export const generateTemperatureForecast = (startTemp, days = 60) => {
  const forecast = [];
  let currentTemp = startTemp;
  for (let i = 0; i < days; i++) {
    currentTemp = getNextNumericTemp(currentTemp);
    forecast.push({
      date: new Date(Date.now() + i * 86400000).toISOString(),
      temp: currentTemp,
      icon: pickRandomWeatherIcon(),
    });
  }
  return forecast;
};
