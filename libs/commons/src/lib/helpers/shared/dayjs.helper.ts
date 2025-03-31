import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';

dayjs.extend(utc);
dayjs.extend(duration);
type DateConfig = {
  utc?: boolean;
  excludeSeconds?: boolean;
};
export class DayjsHelper {
  static new(
    date?: dayjs.ConfigType,
    config: DateConfig = { utc: true, excludeSeconds: true },
  ) {
    let dateInstance: dayjs.Dayjs = dayjs(date, { utc: true });

    if (config?.utc) dateInstance = dateInstance.utc();
    if (config?.excludeSeconds)
      dateInstance = dateInstance.set('second', 0).set('millisecond', 0);

    return dateInstance;
  }

  static isBefore(
    startDate: dayjs.ConfigType,
    endDate: dayjs.ConfigType,
    unit?: dayjs.OpUnitType,
  ) {
    return DayjsHelper.new(startDate).isBefore(endDate, unit);
  }

  static isAfter(
    startDate: dayjs.ConfigType,
    endDate: dayjs.ConfigType,
    unit?: dayjs.OpUnitType,
  ) {
    return DayjsHelper.new(startDate).isAfter(endDate, unit);
  }

  static isSame(
    startDate: dayjs.ConfigType,
    endDate: dayjs.ConfigType,
    unit?: dayjs.OpUnitType,
  ) {
    return DayjsHelper.new(startDate).isSame(endDate, unit);
  }

  static isBeforeOrSame(
    startDate: dayjs.ConfigType,
    endDate: dayjs.ConfigType,
    unit?: dayjs.OpUnitType,
  ) {
    return (
      DayjsHelper.new(startDate).isBefore(endDate, unit) ||
      DayjsHelper.new(startDate).isSame(endDate, unit)
    );
  }

  static isAfterOrSame(
    startDate: dayjs.ConfigType,
    endDate: dayjs.ConfigType,
    unit?: dayjs.OpUnitType,
  ) {
    return (
      DayjsHelper.new(startDate).isAfter(endDate, unit) ||
      DayjsHelper.new(startDate).isSame(endDate, unit)
    );
  }
}
