import { client } from './client';
import { API_KEY } from '@/constants/api';

export async function fetchByCoords(lat: number, lon: number) {
  const response = await client.get(`/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`);
  return response.data;
}

export async function fetchByCity(cityName: string) {
  const response = await client.get(`/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric&lang=pt_br`);
  return response.data;
}
