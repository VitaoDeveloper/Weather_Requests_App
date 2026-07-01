/* eslint-disable import/no-named-as-default-member */
import i18n from 'i18next';

const httpMessages: Record<number, string> = {
  400: 'apiErrors.400',
  401: 'apiErrors.401',
  404: 'apiErrors.404',
  429: 'apiErrors.429',
  500: 'apiErrors.500',
  502: 'apiErrors.502',
  503: 'apiErrors.503',
};

export class ApiError extends Error {
  constructor(
    public status: number,
    apiMessage?: string,
  ) {
    super(httpMessages[status] ? i18n.t(httpMessages[status]) : apiMessage || i18n.t('apiErrors.fallback', { code: status }));
    this.name = 'ApiError';
  }
}

export function parseApiError(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return i18n.t('apiErrors.network');
  }
  if (err instanceof Error) return err.message;
  return i18n.t('apiErrors.unknown');
}
