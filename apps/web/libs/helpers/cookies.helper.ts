import Cookies from 'universal-cookie';

const cookies = new Cookies();

/**
 * Get a cookie by name
 * @param {string} name - Cookie name
 * @returns {string | undefined}
 */
const get = (name: string) => cookies.get(name);

/**
 * Set a cookie with a name, value, and optional expiration
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {object} options - Additional cookie options (e.g., expires, path, domain)
 */
const set = (name: string, value: string, options: object = {}) => {
  cookies.set(name, value, {
    path: '/',
    domain: import.meta.env.VITE_DOMAIN_NAME,
    ...options,
  });
};

/**
 * Remove a cookie by name
 * @param {string} name - Cookie name
 * @param {object} options - Additional cookie options (e.g., path, domain)
 */
const remove = (name: string, options: object = {}) => {
  cookies.remove(name, {
    path: '/',
    domain: process.env['NX_DOMAIN_NAME'],
    ...options,
  });
};

/**
 * Check if a cookie exists
 * @param {string} name - Cookie name
 * @returns {boolean}
 */
const exists = (name: string) => !!cookies.get(name);

export const cookiesHelper = { get, set, remove, exists };
