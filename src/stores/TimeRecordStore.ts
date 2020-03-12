import * as luxon from 'luxon';
import { action, observable, runInAction } from 'mobx';

import { EN_WORK_TYPE } from '../models/time_record/interface/EN_WORK_TYPE';
import { IHoliday } from '../models/time_record/interface/IHoliday';
import { ITimeRecordLogData } from '../models/time_record/interface/ITimeRecordLogData';
import { DeleteTimeRecordJSONSchema } from '../models/time_record/JSONSchema/DeleteTimeRecordJSONSchema';
import { GetHolidaysJSONSchema } from '../models/time_record/JSONSchema/GetHolidaysJSONSchema';
import { GetTimeRecordsJSONSchema } from '../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import { PostTimeRecordJSONSchema } from '../models/time_record/JSONSchema/PostTimeRecordJSONSchema';
import { PostUpdateTimeRecordJSONSchema } from '../models/time_record/JSONSchema/PostUpdateTimeRecordJSONSchema';
import { TimeRecord } from '../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../models/time_record/TimeRecordRequestBuilder';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';

export default class TimeRecordStore {
  @observable private records: Array<{
    [key: string]: { [key: string]: ITimeRecordLogData };
  }> = [];
  @observable private holidays: IHoliday[];
  @observable private isLoading: boolean = false;

  constructor(
    records: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>,
    holidays: IHoliday[]
  ) {
    this.records = records;
    this.holidays = holidays;
  }

  get Records() {
    return this.records;
  }
  set Records(
    value: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>
  ) {
    this.records = value;
  }

  get Holidays() {
    return this.holidays;
  }

  get IsIdle(): boolean {
    return this.isLoading === false;
  }

  @action
  public async findTimeRecord(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>> {
    if (this.isLoading === true) {
      return [];
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const checkParams = {
        query: {
          userId,
          startDate,
          endDate
        }
      };

      const rb = new TimeRecordRequestBuilder(rbParam);
      const findAction = new TimeRecord(rb);

      const [actionResp, holidaysResp] = await Promise.all([
        findAction.findAll(checkParams, GetTimeRecordsJSONSchema),
        findAction.getHolidays(
          {
            query: {
              start_date: startDate,
              end_date: endDate
            }
          },
          GetHolidaysJSONSchema
        )
      ]);
      return runInAction(() => {
        this.isLoading = false;
        if (holidaysResp.type === EN_REQUEST_RESULT.SUCCESS) {
          this.holidays = holidaysResp.data;
        }
        if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
          this.Records = actionResp.data;
          return actionResp.data;
        }
        return [];
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async addTimeRecord(
    authUserId: string,
    userId: string,
    type: EN_WORK_TYPE,
    targetDate?: luxon.DateTime
  ): Promise<{ text: string | null }> {
    if (this.isLoading === true) {
      return { text: null };
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const today = luxon.DateTime.local();

      const checkParams = {
        body: {
          type,
          auth_user_id: authUserId,
          user_id: userId,
          target_date: !!targetDate
            ? targetDate.toFormat('yyyyLLdd')
            : today.toFormat('yyyyLLdd'),
          time: today.toISO()
        }
      };

      // 등록할 날짜가 다른가?
      if (
        !!targetDate &&
        today.toFormat('yyyyLLdd') !== targetDate.toFormat('yyyyLLdd')
      ) {
        checkParams.body.time = luxon.DateTime.fromFormat(
          `${targetDate.toFormat('yyyy-LL-dd')} ${today.toFormat('HH:mm')}`,
          'yyyy-LL-dd HH:mm'
        ).toISO();
      }
      const rb = new TimeRecordRequestBuilder(rbParam);
      const findAction = new TimeRecord(rb);

      const actionResp = await findAction.addWork(
        checkParams,
        PostTimeRecordJSONSchema
      );
      return runInAction(() => {
        this.isLoading = false;
        if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
          return actionResp.data;
        }
        return { text: null };
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async updateTimeRecord(
    authUserId: string,
    userId: string,
    updateDate: string,
    recordKey: string,
    targetKey: keyof ITimeRecordLogData,
    time: string
  ): Promise<boolean> {
    if (this.isLoading === true) {
      return false;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const checkParams = {
        body: {
          auth_user_id: authUserId,
          user_id: userId,
          update_date: updateDate,
          record_key: recordKey,
          target_key: targetKey,
          time
        }
      };

      const rb = new TimeRecordRequestBuilder(rbParam);
      const findAction = new TimeRecord(rb);

      const actionResp = await findAction.updateWorkLog(
        checkParams,
        PostUpdateTimeRecordJSONSchema
      );
      return runInAction(() => {
        this.isLoading = false;
        if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
          return true;
        }
        return false;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async deleteTimeRecord(
    authUserId: string,
    userId: string,
    targetDate: luxon.DateTime,
    logId: string,
    fuseKey?: string
  ): Promise<{ text: string | null }> {
    if (this.isLoading === true) {
      return { text: null };
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const checkParams = {
        body: {
          fuseKey,
          auth_user_id: authUserId,
          user_id: userId,
          target_date: targetDate.toFormat('yyyyLLdd'),
          log_id: logId
        }
      };

      const rb = new TimeRecordRequestBuilder(rbParam);
      const findAction = new TimeRecord(rb);

      const actionResp = await findAction.deleteWorkLog(
        checkParams,
        DeleteTimeRecordJSONSchema
      );
      return runInAction(() => {
        this.isLoading = false;
        console.log(actionResp.type);
        if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
          return actionResp.data;
        }
        return { text: null };
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }
}
