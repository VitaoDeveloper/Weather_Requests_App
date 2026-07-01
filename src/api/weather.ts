import { API_KEY } from '@/constants/api';

const BASE = 'https://api.openweathermap.org/data/2.5';

async function api(path: string) {
  const res = await fetch(`${BASE}${path}&appid=${API_KEY}&units=metric&lang=pt_br`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function fetchByCoords(lat: number, lon: number) {
  return api(`/weather?lat=${lat}&lon=${lon}`);
}

export function fetchByCity(cityName: string) {
  return api(`/weather?q=${encodeURIComponent(cityName)}`);
}
