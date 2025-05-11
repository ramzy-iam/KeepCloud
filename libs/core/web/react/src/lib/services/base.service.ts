import { AxiosRequestConfig } from 'axios';
import { APP_API } from './axios';

export abstract class BaseHttpService {
  protected abstract baseUrl: string;

  protected client = APP_API;

  protected async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await this.client.get<T>(
      `${this.baseUrl}${endpoint}`,
      config,
    );
    return data;
  }

  protected async post<T, U>(
    endpoint: string,
    body: U,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await this.client.post<T>(
      `${this.baseUrl}${endpoint}`,
      body,
      config,
    );
    return data;
  }

  protected async put<T, U>(
    endpoint: string,
    body: U,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await this.client.put<T>(
      `${this.baseUrl}${endpoint}`,
      body,
      config,
    );
    return data;
  }

  protected async patch<T, U>(
    endpoint: string,
    body: U,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await this.client.patch<T>(
      `${this.baseUrl}${endpoint}`,
      body,
      config,
    );
    return data;
  }

  protected async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const { data } = await this.client.delete<T>(
      `${this.baseUrl}${endpoint}`,
      config,
    );
    return data;
  }
}
