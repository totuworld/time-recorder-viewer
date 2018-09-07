import * as luxon from 'luxon';
import { action, observable, runInAction } from 'mobx';

import { IFuseOverWork, IOverWork } from '../models/time_record/interface/IOverWork';
import {
    GetOverloadsByUserIDJSONSchema
} from '../models/time_record/JSONSchema/GetOverloadsJSONSchema';
import {
    PostAddOverloadJSONSchema
} from '../models/time_record/JSONSchema/PostAddOverloadJSONSchema';
import { Overload } from '../models/time_record/Overload';
import { OverloadRequestBuilder } from '../models/time_record/OverloadRequestBuilder';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';

export default class OverloadStore {
  @observable private records: IOverWork[] = [];
  @observable private fuseRecords: IFuseOverWork[] = [];
  @observable private isLoading: boolean = false;

  constructor(
    records: IOverWork[],
    fuseRecords: IFuseOverWork[],
  ) {
    this.records = records;
    this.fuseRecords = fuseRecords;
  }

  get Records() {
    return this.records;
  }

  set Records(value: IOverWork[]) {
    this.records = value;
  }

  get FuseRecords() {
    return this.fuseRecords;
  }

  set FuseRecords(value: IFuseOverWork[]) {
    this.fuseRecords = value;
  }

  get isIdle(): boolean {
    return this.isLoading === false;
  }

  public totalRemain(): luxon.DurationObject | null {
    if (this.records.length <= 0) {
      return null;
    }
    const storeDuration = this.records.reduce(
      (acc, cur) => {
        if (!!cur.over) {
          const duration = luxon.Duration.fromObject(cur.over);
          const updateAcc = acc.plus(duration);
          return updateAcc;
        }
        return acc;
      },
      luxon.Duration.fromObject({hours: 0}));
    const fuseDuration = this.fuseRecords.length <= 0 ?
      luxon.Duration.fromObject({hours: 0}) :
      this.fuseRecords.reduce(
        (acc: luxon.Duration, cur) => {
          if (!!cur.use) {
            const duration = luxon.Duration.fromISO(cur.use);
            const updateAcc = acc.plus(duration);
            return updateAcc;
          }
          return acc;
        },
        luxon.Duration.fromObject({hours: 0}));
    return storeDuration.minus(fuseDuration).toObject();
  }

  public totalRemainTime(format: string = 'hh:mm:ss'): string {
    const totalTime = this.totalRemain();
    if (totalTime === null) {
      return '';
    }
    const duration = luxon.Duration.fromObject(totalTime);
    return duration.toFormat(format);
  }

  @action
  public async findAllOverload(userId: string): Promise<IOverWork[]> {
    if (this.isLoading === true) {
      return [];
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const checkParams = {
        query: {
          user_id: userId,
        }
      };

      const rb = new OverloadRequestBuilder(rbParam);
      const findAction = new Overload(rb);

      const actionResp = await findAction.findAllByUserID(
        checkParams,
        GetOverloadsByUserIDJSONSchema,
      );
      return runInAction(() => {
        this.isLoading = false;
        if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
          this.records = actionResp.data;
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
  public async findAllFuseOverload(userId: string): Promise<IFuseOverWork[]> {
    if (this.isLoading === true) {
      return [];
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const checkParams = {
        query: {
          user_id: userId,
        }
      };

      const rb = new OverloadRequestBuilder(rbParam);
      const findAction = new Overload(rb);

      const actionResp = await findAction.findAllFuseUserID(
        checkParams,
        GetOverloadsByUserIDJSONSchema,
      );
      return runInAction(() => {
        this.isLoading = false;
        if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
          this.fuseRecords = actionResp.data;
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
  public async addFuseOverload(
    authUserId: string,
    userId: string,
    targetDate: luxon.DateTime,
    duration: luxon.Duration,
  ): Promise<{ text: string | null }> {
    if (this.isLoading === true) {
      return { text: null };
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const checkParams = {
        body: {
          duration: duration.toISO(),
          auth_user_id: authUserId,
          user_id: userId,
          target_date: targetDate.toFormat('yyyyLLdd'),
        }
      };

      const rb = new OverloadRequestBuilder(rbParam);
      const findAction = new Overload(rb);

      const actionResp = await findAction.addFuseLog(
        checkParams,
        PostAddOverloadJSONSchema,
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
}