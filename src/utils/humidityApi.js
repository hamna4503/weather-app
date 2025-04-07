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

export const fetchHumidityByCityId = async (cityId) => {
  const cities = await loadCityList();
  const city = cities.find((c) => c.id.toString() === cityId.toString());

  if (!city) throw new Error("City not found");

  const { lat, lon } = city.coord;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  const response = await axios.get(url);
  console.log(response); // For debugging

  return {
    humidity: response.data.main.humidity,
  };
};
