import { mapValues, isArray, isObject, isDate } from 'radash';

const convertUndefinedToNull = (obj: any): any => {
  return isArray(obj)
    ? obj.map(convertUndefinedToNull)
    : isObject(obj) && !isDate(obj)
      ? mapValues(obj, (value) =>
          value === undefined ? null : convertUndefinedToNull(value),
        )
      : obj;
};

export default {
  convertUndefinedToNull,
};
