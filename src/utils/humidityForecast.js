export const generateHumidityForecast = (startHumidity, days = 60) => {
  const matrix = generateHumidityMarkovMatrix(startHumidity);
  let current = startHumidity;
  const forecast = [];
  for (let i = 0; i < days; i++) {
    current = predictNextHumidity(current, matrix);
    forecast.push(current);
  }
  return forecast;
};

const generateHumidityMarkovMatrix = (currentHumidity) => {
  const matrix = {
    10: { 10: 0.4, 20: 0.3, 30: 0.2, 40: 0.1 },
    20: { 10: 0.2, 20: 0.4, 30: 0.3, 40: 0.1 },
    30: { 20: 0.2, 30: 0.5, 40: 0.2, 50: 0.1 },
    40: { 30: 0.3, 40: 0.4, 50: 0.2, 60: 0.1 },
  };
  return matrix[Math.round(currentHumidity / 10) * 10] || matrix[30];
};

const predictNextHumidity = (currentHumidity, matrix) => {
  let rand = Math.random();
  let total = 0;
  for (let hum in matrix) {
    total += matrix[hum];
    if (rand <= total) return parseInt(hum);
  }
  return currentHumidity;
};

export const chunkHumidityForecast = (data, size) => {
  const chunks = [];
  for (let i = 0; i < data?.length; i += size) {
    chunks.push(data.slice(i, i + size));
  }
  return chunks;
};
