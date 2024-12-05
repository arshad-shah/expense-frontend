import { ApiError } from "@/api/common/ApiError";
import { RequestConfig } from "@/api/restClient/types";
import { ApiResponse } from "@/types";

// Main HTTP client class
export class HttpClient {
  private baseUrl: string;
  private defaultConfig: Partial<RequestConfig>;

  constructor(baseUrl: string, defaultConfig: Partial<RequestConfig> = {}) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.defaultConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
      retries: 3,
      retryDelay: 1000, // 1 second
      ...defaultConfig,
    };
  }

  // Helper method to build URL with query parameters
  private buildUrl(endpoint: string, queryParams?: Record<string, string>): string {
    console.log('endpoint', endpoint);
    console.log('baseUrl', this.baseUrl);

    // concatenate the endpoint with the base URL
    const joined = this.baseUrl + endpoint;
    
    
    const url = new URL(joined);
    console.log('url', url.toString());
    
    
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  // Helper method to handle response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: T;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as unknown as T;
    }

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText, data);
    }

    return {
      data,
      status: response.status,
    };
  }

  // Helper method to implement retry logic
  private async withRetry<T>(
    fn: () => Promise<T>,
    retries: number,
    delay: number
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && !(error instanceof ApiError)) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1, delay);
      }
      throw error;
    }
  }

  // Main request method
  public async request<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    config: RequestConfig<TBody> = {}
  ): Promise<ApiResponse<TResponse>> {
    const mergedConfig = {
      ...this.defaultConfig,
      ...config,
      headers: {
        ...this.defaultConfig.headers,
        ...config.headers,
      },
    };

    const { method = 'GET', body, queryParams, timeout, retries, retryDelay } = mergedConfig;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      return await this.withRetry(
        async () => {
          const response = await fetch(this.buildUrl(endpoint, queryParams), {
            method,
            headers: mergedConfig.headers,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          });

          return this.handleResponse<TResponse>(response);
        },
        retries ?? this.defaultConfig.retries!,
        retryDelay ?? this.defaultConfig.retryDelay!
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Convenience methods for common HTTP methods
  public async get<T = unknown>(
    endpoint: string,
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  public async post<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body: TBody,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse, TBody>(endpoint, { ...config, method: 'POST', body });
  }

  public async put<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body: TBody,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse, TBody>(endpoint, { ...config, method: 'PUT', body });
  }

  public async patch<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body: TBody,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<ApiResponse<TResponse>> {
    return this.request<TResponse, TBody>(endpoint, { ...config, method: 'PATCH', body });
  }

  public async delete<T = unknown>(
    endpoint: string,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}