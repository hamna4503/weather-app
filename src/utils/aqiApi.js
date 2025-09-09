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

export const fetchAqiByCityId = async (cityId) => {
  const cities = await loadCityList();
  const city = cities.find((c) => c.id.toString() === cityId.toString());

  if (!city) throw new Error("City not found");

  const { lat, lon } = city.coord;
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  const response = await axios.get(url);
  console.log(response);
  return response.data.list[0].main;
};
