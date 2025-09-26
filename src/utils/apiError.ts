import { ApiErrorShape } from '@/services/api/httpClient';

export function humanizeApiError(err: unknown): string {
  if (!err) return 'Unknown error';
  const e = err as Partial<ApiErrorShape> & { message?: string };
  if (e.code === 'INVALID_CREDENTIALS') return 'Invalid email or password.';
  if (e.code === 'VALIDATION_ERROR') return 'Please check the form and try again.';
  if (e.code === 'NETWORK_ERROR') return 'Network issue. Please retry.';
  return e.message || 'Something went wrong';
}
