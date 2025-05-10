import { BOOLEAN_ENUM } from '@keepcloud/commons/constants';
import { DayjsHelper } from './dayjs.helper';
import { SortOrder } from '../../types';

interface ToNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}

const toLowerCase = (value?: string): string | undefined => {
  if (!value) return;
  return value?.toLowerCase();
};

const trim = (value?: string): string | undefined => {
  if (!value) return;
  return value?.trim();
};

const toDate = (value?: string, excludeSeconds = true): Date | undefined => {
  if (!value) return;
  return DayjsHelper.new(value, { excludeSeconds }).toDate();
};

const toBoolean = (value?: BOOLEAN_ENUM): boolean | undefined => {
  if (!value || (value && !value.trim())) return;

  value = value.trim().toLowerCase() as BOOLEAN_ENUM;

  return Object.values(BOOLEAN_ENUM).includes(value)
    ? [BOOLEAN_ENUM.ONE, BOOLEAN_ENUM.TRUE].includes(value)
    : undefined;
};

const toNumber = (
  value?: string | number,
  opts: ToNumberOptions = {},
): number | undefined => {
  let newValue: number | undefined = undefined;

  if (!value) {
    if (typeof opts.default === 'number') {
      newValue = opts.default;
    } else {
      return undefined;
    }
  }

  if (typeof value === 'string') {
    newValue = Number(value);
  } else {
    newValue = value;
  }

  if (newValue === undefined) return undefined;

  if (opts.min !== undefined && newValue < opts.min) newValue = opts.min;
  if (opts.max !== undefined && newValue > opts.max) newValue = opts.max;
  return newValue;
};

const toOrder = (value?: string): SortOrder | undefined => {
  if (!value) return;

  value = value.trim().toUpperCase();

  return ['ASC', 'DESC'].includes(value) ? (value as SortOrder) : undefined;
};

const toArray = (value?: string, sep = ','): string[] | undefined => {
  if (!value) return;
  return value.split(sep);
};

export default {
  toLowerCase,
  trim,
  toDate,
  toBoolean,
  toNumber,
  toOrder,
  toArray,
};
