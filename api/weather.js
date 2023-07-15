import axios from "axios";

import { apiKey } from "../constants";

const apiCall = async (endpoint) => {
  const options = {
    method: "GET",
    url: endpoint,
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log("error: ", error);
    return {};
  }
};

export const fetchWeatherForecast = (cityName, days) => {
  return apiCall(
    `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=${days}`
  );
};

export const fetchLocations = (cityName) => {
  return apiCall(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${cityName}`);
};
