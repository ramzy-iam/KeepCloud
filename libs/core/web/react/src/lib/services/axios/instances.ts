import axios from 'axios';
import { createAxiosInstance } from './create-instance';

export const APP_API = createAxiosInstance(import.meta.env.VITE_API_BASE_URL);

// for simple axios calls
export const AXIOS_INSTANCE = axios;
