import axios from 'axios';
import { createAxiosInstance } from './create-instance';
import { Env } from '../config';

export const APP_API = createAxiosInstance(Env.VITE_API_BASE_URL);

// for simple axios calls
export const AXIOS_INSTANCE = axios;
