import Cookies from 'universal-cookie';

const cookies = new Cookies();

const domain = import.meta.env.VITE_DOMAIN_NAME;
export class CookiesHelper {
  static remove(name: string, options: object = {}) {
    cookies.remove(name, {
      path: '/',
      domain: domain,
      ...options,
    });
  }
  static set(name: string, value: string, options: object = {}) {
    cookies.set(name, value, {
      path: '/',
      domain: domain,
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
