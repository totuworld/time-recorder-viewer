import * as luxon from 'luxon';

import {
  IFuseOverWork,
  IOverWork
} from '../models/time_record/interface/IOverWork';

export interface ITimeObj {
  REST: { [key: string]: number };
  WORK: { [key: string]: number };
  EMERGENCY: { [key: string]: number };
  REMOTE: { [key: string]: number };
  VACATION: { [key: string]: number };
  FUSEOVERLOAD: { [key: string]: number };
}

export class Util {
  public static dateTimeShort() {
    const time = luxon.DateTime.local();
    return time
      .setLocale('ko-kr')
      .setZone('Asia/Seoul')
      .toLocaleString(luxon.DateTime.DATETIME_SHORT);
  }
  public static toDateTimeShort(timeStr: string) {
    const time = luxon.DateTime.fromISO(timeStr);
    return time
      .setLocale('ko-kr')
      .setZone('Asia/Seoul')
      .toLocaleString(luxon.DateTime.DATETIME_SHORT);
  }
  public static currentTimeStamp() {
    const time = luxon.DateTime.utc();
    return time.toISO();
  }
  public static currentDate() {
    const time = luxon.DateTime.local();
    return time
      .setLocale('ko-kr')
      .setZone('Asia/Seoul')
      .toFormat('yyyyLLdd');
  }
  public static getBetweenDuration(a: string, b: string) {
    const aTime = luxon.DateTime.fromISO(a);
    const bTime = luxon.DateTime.fromISO(b);
    const duration = bTime.diff(aTime).normalize();
    return duration;
  }
  public static reduceTimeObj(timeObj: ITimeObj[], target: keyof ITimeObj) {
    return timeObj.reduce((acc, cur) => {
      const updateData = luxon.Duration.fromObject(acc);
      const durataion = luxon.Duration.fromObject(cur[target]);
      return updateData.plus(durataion).toObject();
    }, {});
  }
  public static getTimeComponents(hours: number): [number, number, number] {
    const h = Math.floor(hours);
    const minutes = (hours - h) * 60;

    const m = Math.floor(minutes);
    const seconds = (minutes - m) * 60;

    const s = Math.floor(seconds);

    return [h, m, s];
  }

  public static calTimeObj(a: object, b: object, operator: string = 'plus') {
    const aDurataion = luxon.Duration.fromObject(a);
    const bDurataion = luxon.Duration.fromObject(b);
    if (operator === 'plus') {
      return aDurataion.plus(bDurataion).toObject();
    }
    return aDurataion.minus(bDurataion).toObject();
  }

  public static reduceDurationObject(
    timeObj: ITimeObj[],
    target: keyof ITimeObj
  ) {
    const totalWorkTimeObj = this.reduceTimeObj(timeObj, target);
    return luxon.Duration.fromObject(totalWorkTimeObj);
  }
  public static totalRemain(
    records: IOverWork[],
    fuseRecords: IFuseOverWork[]
  ): luxon.DurationObject | null {
    if (this.isEmpty(records) || records.length <= 0) {
      return null;
    }
    const storeDuration = records.reduce((acc, cur) => {
      if (!!cur.over) {
        const duration = luxon.Duration.fromObject(cur.over);
        const updateAcc = acc.plus(duration);
        return updateAcc;
      }
      return acc;
    }, luxon.Duration.fromObject({ hours: 0 }));
    const fuseDuration =
      this.isEmpty(fuseRecords) || fuseRecords.length <= 0
        ? luxon.Duration.fromObject({ hours: 0 })
        : fuseRecords.reduce((acc: luxon.Duration, cur) => {
            if (!!cur.use) {
              const duration = luxon.Duration.fromISO(cur.use);
              const updateAcc = acc.plus(duration);
              return updateAcc;
            }
            return acc;
          }, luxon.Duration.fromObject({ hours: 0 }));
    return storeDuration.minus(fuseDuration).toObject();
  }

  public static isEmpty<T>(
    value?: T | undefined | null
  ): value is null | undefined {
    if (value === undefined || value === null) {
      return true;
    }

    if (typeof value === 'number' && isNaN(value)) {
      return true;
    }

    if (typeof value === 'string' && value === '') {
      return true;
    }

    if (typeof value === 'object' && Array.isArray(value) && value.length < 1) {
      return true;
    }

    if (
      typeof value === 'object' &&
      !(value instanceof Date) &&
      Object.keys(value).length < 1
    ) {
      return true;
    }

    return false;
  }

  public static isNotEmpty<T>(value?: T | null | undefined): value is T {
    return !Util.isEmpty<T>(value);
  }
}
