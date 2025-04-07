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

export const generateTemperatureForecast = (startTemp, days = 60) => {
  const forecast = [];
  let current = startTemp;

  for (let i = 0; i < days; i++) {
    const change = Math.floor(Math.random() * 5 - 2); // Random fluctuation -2 to +2
    current = Math.max(-10, Math.min(current + change, 45));
    forecast.push({
      date: new Date(Date.now() + i * 86400000).toISOString(),
      temp: current,
      icon: pickRandomWeatherIcon(),
    });
  }

  return forecast;
};

const pickRandomWeatherIcon = () => {
  const icons = ["01d", "02d", "03d", "04d", "09d", "10d", "11d", "13d", "50d"];
  return icons[Math.floor(Math.random() * icons.length)];
};