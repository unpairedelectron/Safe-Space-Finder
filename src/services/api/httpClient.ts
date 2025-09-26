import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'https://placeholder.api';

export interface ApiErrorShape {
  status: number;
  code?: string;
  message: string;
  details?: any;
}

export class HttpClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
    });

    this.instance.interceptors.request.use((config) => {
      // Attach auth token later
      return config;
    });

    this.instance.interceptors.response.use(
      (resp) => resp,
      (error: AxiosError) => {
        const norm: ApiErrorShape = {
          status: error.response?.status || 0,
            code: (error.response?.data as any)?.code,
          message: (error.response?.data as any)?.message || error.message,
          details: (error.response?.data as any)?.details,
        };
        return Promise.reject(norm);
      }
    );
  }

  get axios() { return this.instance; }

  async get<T=any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const r: AxiosResponse<T> = await this.instance.get(url, config);
    return r.data;
  }
  async post<T=any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const r: AxiosResponse<T> = await this.instance.post(url, data, config);
    return r.data;
  }
  async put<T=any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const r: AxiosResponse<T> = await this.instance.put(url, data, config);
    return r.data;
  }
  async del<T=any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const r: AxiosResponse<T> = await this.instance.delete(url, config);
    return r.data;
  }
}

export const httpClient = new HttpClient();
