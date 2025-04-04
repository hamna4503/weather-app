import axios from "axios";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export const fetchWeatherByCityId = async (cityId) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${API_KEY}&units=metric`;
  const response = await axios.get(url);
  return response.data;
};
