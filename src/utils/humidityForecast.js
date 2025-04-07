
export const generateHumidityForecast = (baseHumidity, totalDays = 60) => {
    const forecast = [];
    for (let i = 0; i < totalDays; i++) {
      const fluctuation = Math.round(Math.random() * 10 - 5); // ±5%
      const value = Math.min(100, Math.max(10, baseHumidity + fluctuation));
      forecast.push(value);
    }
    return forecast;
  };
  
  export const chunkHumidityForecast = (forecastArray, chunkSize = 10) => {
    const chunks = [];
    for (let i = 0; i < forecastArray.length; i += chunkSize) {
      chunks.push(forecastArray.slice(i, i + chunkSize));
    }
    return chunks;
  };
  