import { action, observable, runInAction } from 'mobx';

import { IFuseToVacationRead } from '../models/time_record/interface/IOverWork';
import { FindAllFuseToVacationJSONSchema } from '../models/time_record/JSONSchema/FindAllFuseToVacationJSONSchema';
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
        FindAllFuseToVacationJSONSchema
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
}
