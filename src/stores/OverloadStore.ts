import * as luxon from 'luxon';
import { action, observable, runInAction } from 'mobx';

import {
  IFuseOverWork,
  IOverWork
} from '../models/time_record/interface/IOverWork';
import { DeleteOverLoadByUserIDScheme } from '../models/time_record/JSONSchema/DeleteOverLoadByUserIDScheme';
import { GetOverloadsByUserIDJSONSchema } from '../models/time_record/JSONSchema/GetOverloadsJSONSchema';
import { JSCPostAddOverWork } from '../models/time_record/JSONSchema/JSCPostAddOverWork';
import { PostAddFuseJSONSchema } from '../models/time_record/JSONSchema/PostAddFuseJSONSchema';
import { UseFuseToVacationJSONSchema } from '../models/time_record/JSONSchema/UseFuseToVacationJSONSchema';
import { Overload } from '../models/time_record/Overload';
import { OverloadRequestBuilder } from '../models/time_record/OverloadRequestBuilder';
import { TimeRecord } from '../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../models/time_record/TimeRecordRequestBuilder';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';
import { Util } from '../services/util';

export default class OverloadStore {
  @observable private records: IOverWork[] = [];
  @observable private fuseRecords: IFuseOverWork[] = [];
  @observable private isLoading: boolean = false;

  constructor(records: IOverWork[], fuseRecords: IFuseOverWork[]) {
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
    return Util.totalRemain(this.records, this.fuseRecords);
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
          user_id: userId
        }
      };

      const rb = new OverloadRequestBuilder(rbParam);
      const findAction = new Overload(rb);

      const actionResp = await findAction.findAllByUserID(
        checkParams,
        GetOverloadsByUserIDJSONSchema
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
          user_id: userId
        }
      };

      const rb = new OverloadRequestBuilder(rbParam);
      const findAction = new Overload(rb);

      const actionResp = await findAction.findAllFuseUserID(
        checkParams,
        GetOverloadsByUserIDJSONSchema
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
    isVacation?: boolean,
    note?: string
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
          isVacation,
          note
        }
      };

      const rb = new OverloadRequestBuilder(rbParam);
      const findAction = new Overload(rb);
      console.log('addFuseOverload action');
      const actionResp = await findAction.addFuseLog(
        checkParams,
        PostAddFuseJSONSchema
      );
      console.log(actionResp);
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
  public async useFuseToVacation(
    authUserId: string,
    userId: string,
    targetDate: luxon.DateTime
  ): Promise<{ result: boolean }> {
    if (this.isLoading === true) {
      return { result: false };
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const checkParams = {
        body: {
          auth_user_id: authUserId,
          user_id: userId,
          target_date: targetDate.toFormat('yyyyLLdd')
        }
      };

      const rb = new OverloadRequestBuilder(rbParam);
      const findAction = new Overload(rb);
      console.log('addFuseOverload action');
      const actionResp = await findAction.useFuseToVacation(
        checkParams,
        UseFuseToVacationJSONSchema
      );
      console.log(actionResp);
      return runInAction(() => {
        this.isLoading = false;
        if (actionResp.type === EN_REQUEST_RESULT.SUCCESS && actionResp.data) {
          return actionResp.data;
        }
        return { result: false };
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async addOverWork({
    user_id,
    week,
    manager_id
  }: {
    user_id: string;
    week: string;
    manager_id: string;
  }) {
    if (this.isLoading === true) {
      return {};
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };
      const trRb = new TimeRecordRequestBuilder(rbParam);
      const trAction = new TimeRecord(trRb);

      await trAction.addOverWorkByUser(
        {
          body: {
            user_id,
            week,
            manager_id
          }
        },
        JSCPostAddOverWork
      );

      return runInAction(() => {
        this.isLoading = false;
        return this.records;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async deleteOverWork({
    user_id,
    week,
    manager_id
  }: {
    user_id: string;
    week: string;
    manager_id: string;
  }) {
    if (this.isLoading === true) {
      return false;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const checkParams = {
        body: {
          week,
          user_id,
          auth_user_id: manager_id
        }
      };

      const rb = new OverloadRequestBuilder(rbParam);
      const findAction = new Overload(rb);

      const actionResp = await findAction.deleteOverLoad(
        checkParams,
        DeleteOverLoadByUserIDScheme
      );
      return runInAction(() => {
        this.isLoading = false;
        if (actionResp.type === EN_REQUEST_RESULT.SUCCESS) {
          return actionResp.data !== undefined ? actionResp.data.result : false;
        }
        return false;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }
}
