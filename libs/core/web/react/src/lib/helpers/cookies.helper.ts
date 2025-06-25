import Cookies from 'universal-cookie';
import { Env } from '../services';

const cookies = new Cookies();

export class CookiesHelper {
  static remove(name: string, options: object = {}) {
    cookies.remove(name, {
      path: '/',
      domain: Env.VITE_DOMAIN_NAME,
      ...options,
    });
  }
  static set(name: string, value: string, options: object = {}) {
    cookies.set(name, value, {
      path: '/',
      domain: Env.VITE_DOMAIN_NAME,
      ...options,
    });
  }

  static get(name: string) {
    return cookies.get(name);
  }

  static exists(name: string) {
    return !!cookies.get(name);
  }
}
