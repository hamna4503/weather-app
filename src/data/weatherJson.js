export const weatherData = {
  locations: {
    Lahore: {
      today: {
        condition: "Sunny",
        temperature: 32,
        humidity: 60,
        uvIndex: 7,
        rainChance: 20,
      },
      transitions: {
        Sunny: {
          Sunny: 0.7,
          Cloudy: 0.2,
          Rainy: 0.1,
        },
        Cloudy: {
          Sunny: 0.5,
          Cloudy: 0.3,
          Rainy: 0.2,
        },
        Rainy: {
          Sunny: 0.4,
          Cloudy: 0.4,
          Rainy: 0.2,
        },
      },
      rainRate: 2,
    },
    Karachi: {
      today: {
        condition: "Cloudy",
        temperature: 30,
        humidity: 70,
        uvIndex: 5,
        rainChance: 50,
      },
      transitions: {
        Sunny: {
          Sunny: 0.8,
          Cloudy: 0.1,
          Rainy: 0.1,
        },
        Cloudy: {
          Sunny: 0.4,
          Cloudy: 0.4,
          Rainy: 0.2,
        },
        Rainy: {
          Sunny: 0.3,
          Cloudy: 0.3,
          Rainy: 0.4,
        },
      },
      rainRate: 3,
    },
  },
};
