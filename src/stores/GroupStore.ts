import { action, observable, runInAction } from 'mobx';

import { Group } from '../models/group/Group';
import { GroupRequestBuilder } from '../models/group/GroupRequestBuilder';
import { IHoliday } from '../models/time_record/interface/IHoliday';
import {
  IFuseOverWork,
  IOverWork
} from '../models/time_record/interface/IOverWork';
import { ITimeRecordLogData } from '../models/time_record/interface/ITimeRecordLogData';
import { GetHolidaysJSONSchema } from '../models/time_record/JSONSchema/GetHolidaysJSONSchema';
import { GetOverloadsByUserIDJSONSchema } from '../models/time_record/JSONSchema/GetOverloadsJSONSchema';
import { GetTimeRecordsJSONSchema } from '../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import { JSCPostAddOverWork } from '../models/time_record/JSONSchema/JSCPostAddOverWork';
import { JSCPostAddOverWorkByGroup } from '../models/time_record/JSONSchema/JSCPostAddOverWorkByGroup';
import { Overload } from '../models/time_record/Overload';
import { OverloadRequestBuilder } from '../models/time_record/OverloadRequestBuilder';
import { TimeRecord } from '../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../models/time_record/TimeRecordRequestBuilder';
import { IUserInfo } from '../models/user/interface/IUserInfo';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';

type Records = {
  [key: string]: Array<{
    [key: string]: { [key: string]: ITimeRecordLogData };
  }>;
};
type OverWorks = { [key: string]: IOverWork[] };
type FuseOverWorks = { [key: string]: IFuseOverWork[] };

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
    holidays?: IHoliday[]
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

  get GroupMembers() {
    return this.group;
  }

  /** 특정 주간의 정산사항을 체크한다. */
  public getMemberOverWork({
    user_id,
    week
  }: {
    user_id: string;
    week: string;
  }) {
    const overWorks = this.overWorks[user_id];
    if (
      overWorks === null ||
      overWorks === undefined ||
      Array.isArray(overWorks) === false
    ) {
      return null;
    }
    const filterData = overWorks.filter(fv => fv.week === week);
    return filterData.length > 0 ? filterData[0] : null;
  }

  @action
  public async loadOverWorks({ user_id }: { user_id: string }) {
    if (this.isLoading === true) {
      return {};
    }
    const rbParam: RequestBuilderParams = { isProxy: true };
    const olRb = new OverloadRequestBuilder(rbParam);
    const olAction = new Overload(olRb);
    const olQuery = { query: { user_id } };
    try {
      const resp = await olAction.findAllByUserID(
        olQuery,
        GetOverloadsByUserIDJSONSchema
      );
      return runInAction(() => {
        this.isLoading = false;
        if (resp.type === EN_REQUEST_RESULT.SUCCESS) {
          this.overWorks[user_id] = resp.data;
        }
        return this.records;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async findGroupRecords(
    startDate: string,
    endDate: string
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
        const resp = await trAction.findAll(
          { query: { userId: mv.id, startDate, endDate } },
          GetTimeRecordsJSONSchema
        );
        loadedRecords[mv.id] =
          !!resp && resp.type === EN_REQUEST_RESULT.SUCCESS ? resp.data : [];
      });

      const holidaysResp = await trAction.getHolidays(
        {
          query: {
            start_date: startDate,
            end_date: endDate
          }
        },
        GetHolidaysJSONSchema
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
  public async addOverWorkByGroup({
    group_id,
    week,
    manager_id
  }: {
    group_id: string;
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

      await trAction.addOverWorkByGroup(
        {
          body: {
            group_id,
            week,
            manager_id
          }
        },
        JSCPostAddOverWorkByGroup
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
  public async addMember({
    group_id,
    user_id,
    manager_id
  }: {
    group_id: string;
    user_id: string;
    manager_id: string;
  }): Promise<boolean> {
    if (this.isLoading === true) {
      return false;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };
      const trRb = new GroupRequestBuilder(rbParam);
      const trAction = new Group(trRb);

      const result = await trAction.addMember({
        user_id,
        manager_id,
        group_id
      });

      return runInAction(() => {
        this.isLoading = false;
        return result.type === EN_REQUEST_RESULT.ERROR ? false : result.data;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async deleteMember({
    group_id,
    user_id,
    manager_id
  }: {
    group_id: string;
    user_id: string;
    manager_id: string;
  }): Promise<boolean> {
    if (this.isLoading === true) {
      return false;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };
      const trRb = new GroupRequestBuilder(rbParam);
      const trAction = new Group(trRb);

      const result = await trAction.deleteMember({
        user_id,
        manager_id,
        group_id
      });

      return runInAction(() => {
        this.isLoading = false;
        return result.type === EN_REQUEST_RESULT.ERROR ? false : result.data;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }
}
