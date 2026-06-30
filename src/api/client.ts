import axios from 'axios';

export const client = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 30000,
})
