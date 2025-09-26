import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getApiBaseUrl } from '@/config/env';

const API_BASE_URL = getApiBaseUrl();

export interface ApiErrorShape {
  status: number;
  code?: string;
  message: string;
  details?: any;
}

let pendingRefresh: Promise<string | null> | null = null;

async function getStoredToken() {
  try { return await SecureStore.getItemAsync('accessToken'); } catch { return null; }
}
async function getStoredRefreshToken() {
  try { return await SecureStore.getItemAsync('refreshToken'); } catch { return null; }
}

export class HttpClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
    });

    this.instance.interceptors.request.use(async (config) => {
      const token = await getStoredToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.instance.interceptors.response.use(
      (resp) => resp,
      async (error: AxiosError) => {
        const original = error.config as AxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status || 0;

        if (status === 401 && !original._retry) {
          original._retry = true;
          try {
            const newToken = await this.tryRefresh();
            if (newToken) {
              original.headers = original.headers || {};
              (original.headers as any).Authorization = `Bearer ${newToken}`;
              return this.instance(original);
            }
          } catch {
            // fall through to normalized error
          }
        }

        const norm: ApiErrorShape = {
          status,
          code: (error.response?.data as any)?.code,
          message: (error.response?.data as any)?.message || error.message,
          details: (error.response?.data as any)?.details,
        };
        return Promise.reject(norm);
      }
    );
  }

  private async tryRefresh(): Promise<string | null> {
    if (!pendingRefresh) {
      pendingRefresh = (async () => {
        const refreshToken = await getStoredRefreshToken();
        if (!refreshToken) return null;
        try {
          const resp = await this.instance.post('/auth/refresh', { refreshToken });
          const newAccess = (resp.data as any)?.accessToken;
          if (newAccess) await SecureStore.setItemAsync('accessToken', newAccess);
          return newAccess || null;
        } catch {
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
          return null;
        } finally {
          pendingRefresh = null;
        }
      })();
    }
    return pendingRefresh;
  }

  get axios() { return this.instance; }

  async get<T=any>(url: string, config?: AxiosRequestConfig): Promise<T> { const r: AxiosResponse<T> = await this.instance.get(url, config); return r.data; }
  async post<T=any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> { const r: AxiosResponse<T> = await this.instance.post(url, data, config); return r.data; }
  async put<T=any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> { const r: AxiosResponse<T> = await this.instance.put(url, data, config); return r.data; }
  async del<T=any>(url: string, config?: AxiosRequestConfig): Promise<T> { const r: AxiosResponse<T> = await this.instance.delete(url, config); return r.data; }
}

export const httpClient = new HttpClient();
