import { action, observable, runInAction } from 'mobx';

import { IOverWork } from '../models/time_record/interface/IOverWork';
import { GetOverloadsJSONSchema } from '../models/time_record/JSONSchema/GetOverloadsJSONSchema';
import { Overload } from '../models/time_record/Overload';
import { OverloadRequestBuilder } from '../models/time_record/OverloadRequestBuilder';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';

export default class OverloadStore {
  @observable private records: IOverWork[] = [];
  @observable private isLoading: boolean = false;

  get Records() {
    return this.records;
  }

  set Records(value: IOverWork[]) {
    this.records = value;
  }

  get isIdle(): boolean {
    return this.isLoading === false;
  }

  @action
  public async findAllOverload(authUserId: string): Promise<IOverWork[]> {
    if (this.isLoading === true) {
      return [];
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const checkParams = {
        query: {
          auth_user_id: authUserId,
        }
      };

      const rb = new OverloadRequestBuilder(rbParam);
      const findAction = new Overload(rb);

      const actionResp = await findAction.findAll(
        checkParams,
        GetOverloadsJSONSchema,
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
}