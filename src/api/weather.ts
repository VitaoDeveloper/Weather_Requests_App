/* eslint-disable import/no-named-as-default-member */
import i18n from 'i18next';
import type { ApiResponse } from '@/types/ApiResponse';
import { ApiError } from '@/utils/parseApiError';
import { getKey } from '@/utils/keyStore';

const BASE = 'https://api.openweathermap.org/data/2.5';

// ponytail: simple lang map, extract if more locales added
const LANG_MAP: Record<string, string> = { en: 'en', pt: 'pt_br', ru: 'ru' };

function langParam(): string {
  const lng = i18n.language?.slice(0, 2) || 'en';
  return LANG_MAP[lng] || 'en';
}

async function api(path: string): Promise<ApiResponse> {
  const key = await getKey();
  if (!key) throw new ApiError(401, i18n.t('byokErrors.noKey'));
  const res = await fetch(`${BASE}${path}&appid=${key}&units=metric&lang=${langParam()}`);
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

/** Lightweight validation call — used before persisting a user-provided key */
export async function validateKey(key: string): Promise<boolean> {
  const res = await fetch(`${BASE}/weather?lat=0&lon=0&appid=${key}&units=metric`);
  if (res.ok) return true;
  if (res.status === 401) return false; // invalid key — expected during validation
  const body = await res.json().catch(() => ({}));
  throw new ApiError(res.status, body.message);
}
