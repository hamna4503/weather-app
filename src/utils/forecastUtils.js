export const getIconUrl = (condition) => {
  const icons = {
    Clear: "01d",
    Clouds: "02d",
    Rain: "09d",
    Drizzle: "10d",
    Thunderstorm: "11d",
    Snow: "13d",
    Fog: "50d",
  };
  return `https://openweathermap.org/img/wn/${
    icons[condition] || "01d"
  }@2x.png`;
};

export const generateForecast = (startState, days = 60) => {
  const matrix = generateMarkovMatrix(startState);
  let current = startState;
  const forecast = [];
  for (let i = 0; i < days; i++) {
    current = predictNextState(current, matrix);
    forecast.push(current);
  }
  return forecast;
};
export const weatherMatrix = {
  Clear: { Clear: 0.5, Clouds: 0.3, Rain: 0.1, Snow: 0.05, Drizzle: 0.05 },
  Clouds: { Clear: 0.3, Clouds: 0.4, Rain: 0.2, Snow: 0.05 },
  Rain: { Clear: 0.2, Clouds: 0.3, Rain: 0.4, Snow: 0.1 },
  Snow: { Clear: 0.1, Clouds: 0.3, Rain: 0.2, Snow: 0.3 },
  Drizzle: { Clear: 0.1, Clouds: 0.3, Rain: 0.4, Snow: 0.05 },
  Thunderstorm: { Clear: 0.1, Clouds: 0.2, Rain: 0.5, Thunderstorm: 0.2 },
  Fog: { Clear: 0.2, Clouds: 0.3, Fog: 0.4 },
};
const generateMarkovMatrix = (currentState) => {
  const matrix = weatherMatrix;
  return matrix[currentState] || matrix.Clear;
};

const predictNextState = (currentState, matrix) => {
  let rand = Math.random();
  let total = 0;
  for (let state in matrix) {
    total += matrix[state];
    if (rand <= total) return state;
  }
  return currentState;
};

export const chunkForecast = (data, size) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += size) {
    chunks.push(data.slice(i, i + size));
  }
  return chunks;
};
