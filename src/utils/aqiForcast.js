export const getAqiLevel = (aqi) => {
  const aqiLevels = {
    1: { label: "Good", color: "bg-green-400" },
    2: { label: "Fair", color: "bg-yellow-400" },
    3: { label: "Moderate", color: "bg-orange-400" },
    4: { label: "Poor", color: "bg-red-500" },
    5: { label: "Very Poor", color: "bg-red-700" },
  };
  return aqiLevels[aqi] || { label: "Unknown", color: "bg-gray-400" };
};

export const generateAqiForecast = (startAqi, days = 60) => {
  const matrix = generateAqiMarkovMatrix(startAqi);
  let current = startAqi;
  const forecast = [];
  for (let i = 0; i < days; i++) {
    current = predictNextAqi(current, matrix);
    forecast.push(current);
  }
  return forecast;
};

const generateAqiMarkovMatrix = (currentAqi) => {
  const matrix = {
    1: { 1: 0.5, 2: 0.3, 3: 0.1, 4: 0.05, 5: 0.05 },
    2: { 1: 0.3, 2: 0.4, 3: 0.2, 4: 0.05 },
    3: { 1: 0.2, 2: 0.3, 3: 0.4, 4: 0.1 },
    4: { 1: 0.1, 2: 0.3, 3: 0.2, 4: 0.3 },
    5: { 1: 0.1, 2: 0.3, 3: 0.4, 5: 0.2 },
  };
  return matrix[currentAqi] || matrix[1];
};

const predictNextAqi = (currentAqi, matrix) => {
  let rand = Math.random();
  let total = 0;
  for (let aqi in matrix) {
    total += matrix[aqi];
    if (rand <= total) return parseInt(aqi);
  }
  return currentAqi;
};

export const chunkAqiForecast = (data, size) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += size) {
    chunks.push(data.slice(i, i + size));
  }
  return chunks;
};
