import { action, observable, runInAction } from 'mobx';

import { IUserInfo } from '../models/user/interface/IUserInfo';
import { GetUserInfoJSONSchema } from '../models/user/JSONSchema/GetUserInfoJSONSchema';
import { User } from '../models/user/User';
import { UserRequestBuilder } from '../models/user/UserRequestBuilder';
import { Auth } from '../services/auth';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';

export default class LoginStore {
  @observable private userInfo: IUserInfo | null;
  @observable private isLoading: boolean = false;

  constructor(
    userInfo: IUserInfo | null,
  ) {
    this.userInfo = userInfo;
  }

  get isLogin() {
    return Auth.isLogined;
  }

  get UserInfo() {
    if (!!this.userInfo) {
      return this.userInfo;
    }
    return null;
  }

  @action
  public async findUserInfo(
    userId: string
  ) {
    if (this.isLoading === true) {
      return null;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const rb = new UserRequestBuilder(rbParam);
      const userAction = new User(rb);
      const resp = await userAction.find(
        {query: { userId }},
        GetUserInfoJSONSchema,
      );
      if (resp.type === EN_REQUEST_RESULT.ERROR) {
        return null;
      }
      return runInAction(() => {
        this.isLoading = false;
        this.userInfo = resp.data;
        return this.userInfo;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }
}