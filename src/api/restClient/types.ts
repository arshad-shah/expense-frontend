// Types for HTTP methods and request configurations
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig<T = unknown> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: T;
  queryParams?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  ok: boolean;
}