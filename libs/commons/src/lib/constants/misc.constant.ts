export enum PAGINATION {
  DEFAULT_PAGE = 1,
  DEFAULT_PAGE_SIZE = 10,
  DEFAULT_MAX_PAGE_SIZE = 100,
  ALL_ITEMS = 1_000_000,
}

export enum BOOLEAN_ENUM {
  TRUE = 'true',
  ONE = '1',
  FALSE = 'false',
  ZERO = '0',
}

const templatePrefix = 'keepcloud/';

/**
 * Template key constants
 */
export enum TemplateKey {
  WELCOME_EMAIL = `${templatePrefix}email/welcome.hbs`,
}
