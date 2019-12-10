import { action, observable, runInAction } from 'mobx';

import { IFuseToVacationRead } from '../models/time_record/interface/IOverWork';
import { JSCFindAllFuseToVacation } from '../models/time_record/JSONSchema/JSCFindAllFuseToVacation';
import { JSCPostConvertFuseToVacation } from '../models/time_record/JSONSchema/JSCPostConvertFuseToVacation';
import * as JSCFvc from '../models/time_record/JSONSchema/JSCPutDisableExpiredFuseToVacation';
import { Overload } from '../models/time_record/Overload';
import { OverloadRequestBuilder } from '../models/time_record/OverloadRequestBuilder';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';

export default class FuseToVacationStore {
  @observable private records: IFuseToVacationRead[] = [];
  @observable private isLoading: boolean = false;

  constructor(records: IFuseToVacationRead[]) {
    this.records = records;
  }

  get Records() {
    return this.records;
  }

  set Records(value: IFuseToVacationRead[]) {
    this.records = value;
  }

  get isIdle(): boolean {
    return this.isLoading === false;
  }

  @action
  public async findAllFuseToVacation(userID: string) {
    if (this.isLoading === true) {
      return [];
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const checkParams = {
        params: {
          user_id: userID
        }
      };

      const rb = new OverloadRequestBuilder(rbParam);
      const findAction = new Overload(rb);

      const actionResp = await findAction.findAllFuseToVacationByUserID(
        checkParams,
        JSCFindAllFuseToVacation
      );
      return runInAction(() => {
        this.isLoading = false;
        if (actionResp.type === EN_REQUEST_RESULT.SUCCESS && actionResp.data) {
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
  /** 특정 그룹의 초과근무 시간을 휴가금고에 넣는다. */
  public async convertFuseToVacation({
    expireDate,
    note,
    groupID,
    auth_id
  }: {
    expireDate: string;
    note: string;
    groupID: string;
    auth_id: string;
  }) {
    if (this.isLoading === true) {
      return false;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const checkParams = {
        params: {
          group_id: groupID
        },
        body: {
          expireDate,
          note,
          auth_id
        }
      };

      const rb = new OverloadRequestBuilder(rbParam);
      const findAction = new Overload(rb);

      const actionResp = await findAction.convertFuseToVacationByGroupID(
        checkParams,
        JSCPostConvertFuseToVacation
      );
      return runInAction(() => {
        this.isLoading = false;
        return actionResp.type === EN_REQUEST_RESULT.SUCCESS;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  /** 만료된 휴가금고를 사용할 수 없도록 처리한다 */
  public async disableExpiredFuseToVacation({
    expireDate,
    expireDesc,
    groupID,
    auth_id
  }: {
    expireDate: string;
    expireDesc: string;
    groupID: string;
    auth_id: string;
  }) {
    if (this.isLoading === true) {
      return false;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const checkParams = {
        params: {
          group_id: groupID
        },
        body: {
          expireDate,
          auth_id,
          expireNote: expireDesc
        }
      };

      const rb = new OverloadRequestBuilder(rbParam);
      const findAction = new Overload(rb);

      const actionResp = await findAction.disableExpiredFuseToVacationByGroupID(
        checkParams,
        JSCFvc.JSCPutDisableExpiredFuseToVacation
      );
      return runInAction(() => {
        this.isLoading = false;
        return actionResp.type === EN_REQUEST_RESULT.SUCCESS;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }
}
