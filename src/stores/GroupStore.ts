import { action, observable, runInAction } from 'mobx';

import { IHoliday } from '../models/time_record/interface/IHoliday';
import { IFuseOverWork, IOverWork } from '../models/time_record/interface/IOverWork';
import { ITimeRecordLogData } from '../models/time_record/interface/ITimeRecordLogData';
import { GetHolidyasJSONSchema } from '../models/time_record/JSONSchema/GetHolidyasJSONSchema';
import {
    GetTimeRecordsJSONSchema
} from '../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import { TimeRecord } from '../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../models/time_record/TimeRecordRequestBuilder';
import { IUserInfo } from '../models/user/interface/IUserInfo';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';

type Records = {[key: string]: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>};
type OverWorks = {[key: string]: IOverWork[]};
type FuseOverWorks = {[key: string]: IFuseOverWork[]};

export default class GroupStore {
  @observable private records: Records;
  @observable private isLoading: boolean = false;
  @observable private group: IUserInfo[] = [];
  @observable private overWorks: OverWorks;
  @observable private fuseOverWorks: FuseOverWorks;
  @observable private holidays: IHoliday[] = [];

  constructor(
    records: Records,
    group: IUserInfo[],
    overWorks?: OverWorks,
    fuseOverWorks?: FuseOverWorks,
    holidays?: IHoliday[],
  ) {
    this.records = records;
    this.group = group;

    this.overWorks = {};
    this.fuseOverWorks = {};
    if (!!overWorks) {
      this.overWorks = overWorks;
    }
    if (!!fuseOverWorks) {
      this.fuseOverWorks = fuseOverWorks;
    }
    if (!!holidays) {
      this.holidays = holidays;
    }
  }

  get Records() {
    return this.records;
  }
  set Records(value: Records) {
    this.records = value;
  }
  get OverWorks() {
    return this.overWorks;
  }
  get FuseOverWorks() {
    return this.fuseOverWorks;
  }
  get Holidays() {
    return this.holidays;
  }

  get isIdle(): boolean {
    return this.isLoading === false;
  }

  @action
  public async findGroupRecords(
    startDate: string,
    endDate: string,
  ): Promise<Records> {
    if (this.isLoading === true) {
      return {};
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };
      const trRb = new TimeRecordRequestBuilder(rbParam);
      const trAction = new TimeRecord(trRb);

      const loadedRecords = {};
      const promises = this.group.map(async (mv, i) => {
        const resp = await trAction.findAll({query: { userId: mv.id, startDate, endDate }}, GetTimeRecordsJSONSchema);
        loadedRecords[mv.id] = !!resp && resp.type === EN_REQUEST_RESULT.SUCCESS ? resp.data : [];
      });

      const holidaysResp = await trAction.getHolidays(
        {
          query: {
            start_date: startDate,
            end_date: endDate
          }
        },
        GetHolidyasJSONSchema
      );

      await Promise.all(promises);
      
      return runInAction(() => {
        this.isLoading = false;
        this.records = loadedRecords;
        if (holidaysResp.type === EN_REQUEST_RESULT.SUCCESS) {
          this.holidays = holidaysResp.data;
        }
        return this.records;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

}