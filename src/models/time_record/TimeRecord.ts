import debug from 'debug';
import * as luxon from 'luxon';
import moment from 'moment';

import RequestService from '../../services/requestService';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { Util } from '../../services/util';
import { IJSONSchemaType } from '../common/IJSONSchemaType';
import { AddTimeRecordRequestParam } from './interface/AddTimeRecordRequestParam';
import { EN_WORK_TYPE } from './interface/EN_WORK_TYPE';
import { ITimeRecordLogData } from './interface/ITimeRecordLogData';
import { IAddTimeRecord, ITimeRecords, IUpdateTimeRecord } from './interface/ITimeRecords';
import { TimeRecordRecordsRequestsParam } from './interface/TimeRecordRecordsRequestsParam';
import { UpdateTimeRecordRequestParam } from './interface/UpdateTimeRecordRequestParam';
import { TimeRecordRequestBuilder } from './TimeRecordRequestBuilder';

const log = debug('trv:TimeRecord');

export class TimeRecord {
  public static extractEtcTime(
    childData: {[key: string]: ITimeRecordLogData },
    target: EN_WORK_TYPE) {
    const filteredValues = Object.keys(childData)
      .filter((fv) =>
        childData[fv].type === target
      )
      .map((mv) => childData[mv])
      .reduce<{ time: number; lastWorkTimeStamp: string; timeObj: {[key: string]: number} }>(
        (acc, cur: ITimeRecordLogData) => {
          if (!!cur.done) {
            const duration = Util.getBetweenDuration(
              cur.time,
              cur.done
            );
            acc.time += duration.as('hours');
            const durationObj = duration.toObject();
            const updateTimeObj = {...acc.timeObj};
            Object.keys(durationObj).forEach((fv) => {
              if (!!updateTimeObj[fv]) {
                updateTimeObj[fv] += durationObj[fv];
              } else {
                updateTimeObj[fv] = durationObj[fv];
              }
            });
            acc.timeObj = updateTimeObj;
          }
          return acc;
        },
        {
          time: 0,
          lastWorkTimeStamp: '',
          timeObj: {},
        }
      );
    return {
      ...filteredValues,
      noBye: false,
    };
  }

  public static extractRestTime(childData: {[key: string]: ITimeRecordLogData }) {
    return TimeRecord.extractEtcTime(childData, EN_WORK_TYPE.REST);
  }

  public static extractEmergencyTime(childData: {[key: string]: ITimeRecordLogData }) {
    return TimeRecord.extractEtcTime(childData, EN_WORK_TYPE.EMERGENCY);
  }

  public static extractWorkTime(childData: {[key: string]: ITimeRecordLogData }) {

    // 일한 시간 뽑아내자.
    // 출/퇴근 필터
    const workFilter = Object.keys(childData)
      .filter((fv) =>
        childData[fv].type === EN_WORK_TYPE.WORK ||
        childData[fv].type === EN_WORK_TYPE.BYEBYE
      )
      .map((mv) => childData[mv])
      .reduce<{ time: number; lastWorkTimeStamp: string, timeObj: {[key: string]: number} }>(
        (acc, cur: ITimeRecordLogData) => {
          // 출근인가?
          if (cur.type === EN_WORK_TYPE.WORK) {
            acc.lastWorkTimeStamp = cur.time;
          }
          // 퇴근인가?
          if (cur.type === EN_WORK_TYPE.BYEBYE) {
            if (!!acc.lastWorkTimeStamp) {
              // 앞 시간부터 비교해서 시간 추가하자.
              const duration = Util.getBetweenDuration(
                acc.lastWorkTimeStamp,
                cur.time
              );
              acc.time += duration.as('hours');
              const durationObj = duration.toObject();
              const updateTimeObj = {...acc.timeObj};
              Object.keys(durationObj).forEach((fv) => {
                if (!!updateTimeObj[fv]) {
                  updateTimeObj[fv] += durationObj[fv];
                } else {
                  updateTimeObj[fv] = durationObj[fv];
                }
              });
              acc.timeObj = updateTimeObj;
            }
          }
          return acc;
        },
        {
          time: 0,
          lastWorkTimeStamp: '',
          timeObj: {},
        }
      );
    // 출근은 찍혔지만 퇴근 기록이 없는가?
    const noBye = !!workFilter.lastWorkTimeStamp && workFilter.time === 0;
    if (noBye === true) {
      const current = Util.currentTimeStamp();
      const duration = Util.getBetweenDuration(
        workFilter.lastWorkTimeStamp,
        current
      );
      workFilter.time += duration.as('hours');
    }
    return {
      ...workFilter,
      noBye
    };
  }

  public static convertWorkTime(
    value: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>,
    startDate: Date,
    endDate: Date,
  ) {
    const updateDatas = value.length > 0 ? value.map((mv) => {
      const dateStr = Object.keys(mv)[0];
      const data = {
        name: dateStr,
        data: { REST: 0, WORK: 0, EMERGENCY: 0 },
        timeObj: { REST: {}, WORK: {}, EMERGENCY: {} },
      };
      const workTime = TimeRecord.extractWorkTime(mv[dateStr]);
      const restTime = TimeRecord.extractRestTime(mv[dateStr]);
      const emergencyTime = TimeRecord.extractEmergencyTime(mv[dateStr]);
      data.data.WORK = workTime.time;
      data.timeObj.WORK = workTime.timeObj;
      data.data.REST = restTime.time;
      data.timeObj.REST = restTime.timeObj;
      data.data.EMERGENCY = emergencyTime.time;
      data.timeObj.EMERGENCY = emergencyTime.timeObj;
      return data;
    }) : [];
    const timeObjs = updateDatas.map((mv) => mv.timeObj);
    const timeLawRestObjs = updateDatas.filter((fv) => fv.data.WORK >= 8)
      .map((mv) => { const updateObj = { ...mv.timeObj, REST: { hours: 1 } }; return updateObj; });
    const totalWorkTimeStr = Util.reduceDurationObject(timeObjs, EN_WORK_TYPE.WORK).toFormat('hh:mm:ss');
    const totalLawRestTimeStr = Util.reduceDurationObject(timeLawRestObjs, EN_WORK_TYPE.REST).toFormat('hh:mm:ss');
    const totalRestTimeStr = Util.reduceDurationObject(timeObjs, EN_WORK_TYPE.REST).toFormat('hh:mm:ss');
    const totalEmergencyTimeStr = Util.reduceDurationObject(timeObjs, EN_WORK_TYPE.EMERGENCY).toFormat('hh:mm:ss');
    // const calWorkTime = totalWorkTime - totalRestTime - totalLawRestTime + totalEmergencyTime;
    let calWorkTimeObj = Util.calTimeObj(
      Util.reduceTimeObj(timeObjs, EN_WORK_TYPE.WORK),
      Util.reduceTimeObj(timeObjs, EN_WORK_TYPE.EMERGENCY));
    calWorkTimeObj = Util.calTimeObj(calWorkTimeObj, Util.reduceTimeObj(timeObjs, EN_WORK_TYPE.REST), 'minus');
    calWorkTimeObj = Util.calTimeObj(calWorkTimeObj, Util.reduceTimeObj(timeLawRestObjs, EN_WORK_TYPE.REST), 'minus');
    const calWorkTimeStr = luxon.Duration.fromObject(calWorkTimeObj).toFormat('hh:mm:ss');
    let range = startDate === endDate ? 1 :
      moment(endDate).diff(moment(startDate), 'days') + 1;
    if (range >= 7) {
      const weekCount = (range - (range % 7)) / 7;
      range -= (weekCount * 2);
    }
    const overTimeObj = luxon.Duration
      .fromObject(Util.calTimeObj(calWorkTimeObj, { hours: 8 * range }, 'minus'));
    const overTimeStr = overTimeObj.toFormat('hh:mm:ss');
    return {
      updateDatas,
      calWorkTimeObj,
      overTimeObj: overTimeObj.toObject(),
      calWorkTimeStr, overTimeStr, totalWorkTimeStr, totalEmergencyTimeStr, totalRestTimeStr, totalLawRestTimeStr };
  }

  constructor(private rb: TimeRecordRequestBuilder) {}

  public async findAll(
    params: TimeRecordRecordsRequestsParam,
    schema: IJSONSchemaType
  ): Promise<ITimeRecords> {
    log(params);
    const validParam = Requester.validateParam(params, schema);
    log('validParam: ', validParam);
    if (validParam === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: [] };
    }
    const query = this.rb.createGetUserRecordsQuery({
      method: 'GET',
      headers: {},
      query: params.query
    });

    log(query);

    const requester = RequestService.create(query.url);
    const response = await requester.call<
      Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>
    >(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: [] };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async addWork(
    params: AddTimeRecordRequestParam,
    schema: IJSONSchemaType
  ): Promise<IAddTimeRecord> {
    log(params);
    const validParam = Requester.validateParam(params, schema);
    log('validParam: ', validParam);
    if (validParam === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: { text: null } };
    }
    const query = this.rb.createPostUserRecordQuery({
      method: 'POST',
      headers: {},
      body: params.body
    });

    log(query);

    const requester = RequestService.create(query.url);
    const response = await requester.call<{text: string | null}>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: { text: null } };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async updateWorkLog(
    params: UpdateTimeRecordRequestParam,
    schema: IJSONSchemaType
  ): Promise<IUpdateTimeRecord> {
    log(params);
    const validParam = Requester.validateParam(params, schema);
    log('validParam: ', validParam);
    if (validParam === false) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }
    const query = this.rb.createPostUpdateUserRecordQuery({
      method: 'POST',
      headers: {},
      body: params.body
    });

    log(query);

    const requester = RequestService.create(query.url);
    const response = await requester.call<null>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS };
  }
}
