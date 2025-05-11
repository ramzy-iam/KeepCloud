import axios, {
  AxiosResponse,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { CookiesHelper } from '../../helpers';
import { renewAccessToken } from './token.helper';
import { ACCESS_TOKEN } from '@keepcloud/commons/constants';
import { ApiError } from './type';

const axiosOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const handleCancelRequest = () => {
  const cancelResult = {
    statusCode: 429,
    message: 'Cancel Request',
    error: 'Cancel Request',
  };
  return Promise.reject(cancelResult);
};

export const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const axiosInstance = axios.create({ ...axiosOptions, baseURL });

  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const accessToken = CookiesHelper.get(ACCESS_TOKEN);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error: ApiError) => Promise.reject(error),
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: ApiError) => {
      const { response, config } = error;

      if (axios.isCancel(error)) return handleCancelRequest();

      if (response?.status === 401) {
        try {
          return await renewAccessToken(axiosInstance, config);
        } catch (err) {
          return Promise.reject(err);
        }
      }
      return Promise.reject(response?.data || error);
    },
  );

  return axiosInstance;
};
