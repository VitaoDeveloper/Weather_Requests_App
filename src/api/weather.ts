import i18n from 'i18next';
import { API_KEY } from '@/constants/api';
import type { ApiResponse } from '@/types/ApiResponse';
import { ApiError } from '@/utils/parseApiError';

const BASE = 'https://api.openweathermap.org/data/2.5';

// ponytail: simple lang map, extract if more locales added
const LANG_MAP: Record<string, string> = { en: 'en', pt: 'pt_br', ru: 'ru' };

function langParam(): string {
  const lng = i18n.language?.slice(0, 2) || 'en';
  return LANG_MAP[lng] || 'en';
}

async function api(path: string): Promise<ApiResponse> {
  const res = await fetch(`${BASE}${path}&appid=${API_KEY}&units=metric&lang=${langParam()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message);
  }
  return res.json() as Promise<ApiResponse>;
}

export function fetchByCoords(lat: number, lon: number): Promise<ApiResponse> {
  return api(`/weather?lat=${lat}&lon=${lon}`);
}

export function fetchByCity(cityName: string): Promise<ApiResponse> {
  return api(`/weather?q=${encodeURIComponent(cityName)}`);
}
