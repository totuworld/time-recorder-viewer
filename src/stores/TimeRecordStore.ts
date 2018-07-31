import { action, observable, runInAction } from 'mobx';

import { ITimeRecordLogData } from '../models/time_record/interface/ITimeRecordLogData';
import {
    GetTimeRecordsJSONSchema
} from '../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import { TimeRecord } from '../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../models/time_record/TimeRecordRequestBuilder';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';

export default class TimeRecordStore {
  @observable private records: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }> = [];
  @observable private isLoading: boolean = false;

  constructor(
    records: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>,
  ) {
    this.records = records;
  }

  get Records() {
    return this.records;
  }
  set Records(value: Array<{ [key: string]: { [key: string]: ITimeRecordLogData } }>) {
    this.records = value;
  }

  get isIdle(): boolean {
    return this.isLoading === false;
  }

  @action
  public async findTimeRecord(
    userId: string,
    startDate: string,
    endDate: string,
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
          endDate,
        }
      };

      const rb = new TimeRecordRequestBuilder(rbParam);
      const findAction = new TimeRecord(rb);

      const actionResp = await findAction.findAll(
        checkParams,
        GetTimeRecordsJSONSchema,
      );
      return runInAction(() => {
        this.isLoading = false;
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

}