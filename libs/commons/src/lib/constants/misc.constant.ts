export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_PAGE_SIZE_INFINITY = 10 ** 6;

export const ACCOUNT_VERIFICATION_EXPIRY_TIME = 10; //minutes

export const RESET_PASSWORD_EXPIRY_TIME = 10; //minutes

export const JWT_EXPIRY_DATE = '30d';

export const INVITATION_TOKEN_EXPIRY_TIME = 3; //days

export enum PAGINATION {
  DEFAULT_PAGE = 1,
  DEFAULT_LIMIT = 10,
  MAX_LIMIT = 50,
  ALL_ITEMS = 1_000_000,
}

export enum BOOLEAN_ENUM {
  TRUE = 'true',
  ONE = '1',
  FALSE = 'false',
  ZERO = '0',
}
