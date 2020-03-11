import { action, observable, runInAction } from 'mobx';

import { ILoginUserInfo } from '../models/user/interface/ILoginUser';
import { IUserInfo } from '../models/user/interface/IUserInfo';
import { GetUserInfoJSONSchema } from '../models/user/JSONSchema/GetUserInfoJSONSchema';
import { User } from '../models/user/User';
import { UserRequestBuilder } from '../models/user/UserRequestBuilder';
import { Auth } from '../services/auth';
import { RequestBuilderParams } from '../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../services/requestService/requesters/AxiosRequester';

export default class LoginStore {
  @observable private userInfo: IUserInfo | null;
  @observable private loginUserInfo: ILoginUserInfo | null;
  @observable private isLoading: boolean = false;

  constructor(userInfo: IUserInfo | null) {
    this.userInfo = userInfo;
    this.loginUserInfo = null;
  }

  get isLogin() {
    return !!this.userInfo;
  }

  get UserInfo() {
    if (!!this.userInfo) {
      return this.userInfo;
    }
    return null;
  }

  get LoginUserInfo() {
    if (!!this.loginUserInfo) {
      return this.loginUserInfo;
    }
    return null;
  }

  @action
  public async findUserInfo(userId: string) {
    if (this.isLoading === true) {
      return null;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const rb = new UserRequestBuilder(rbParam);
      const userAction = new User(rb);
      const resp = await userAction.find(
        { query: { userId } },
        GetUserInfoJSONSchema
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
  @action
  public async findLoginUserInfo(loginUserUid: string) {
    if (this.isLoading === true) {
      return null;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const rb = new UserRequestBuilder(rbParam);
      const userAction = new User(rb);
      const resp = await userAction.findLoginUser({ user_uid: loginUserUid });
      if (resp.type === EN_REQUEST_RESULT.ERROR) {
        return null;
      }
      return runInAction(() => {
        this.isLoading = false;
        if (!!resp.data && !!resp.data.data) {
          this.loginUserInfo = { ...resp.data.data, user_uid: loginUserUid };
        }
        return this.loginUserInfo;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public logout(isServer: boolean) {
    if (isServer === true) {
      return;
    }
    Auth.logout();
    runInAction(() => {
      this.userInfo = null;
    });
  }

  @action
  public async activeAdminRole({ userId }: { userId: string }) {
    if (this.isLoading === true) {
      return false;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const rb = new UserRequestBuilder(rbParam);
      const userAction = new User(rb);
      const resp = await userAction.activeAdminRole({ userId });
      if (resp.type === EN_REQUEST_RESULT.ERROR) {
        return false;
      }
      return runInAction(() => {
        this.isLoading = false;
        return true;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }

  @action
  public async deactiveAdminRole({ userId }: { userId: string }) {
    if (this.isLoading === true) {
      return false;
    }
    try {
      this.isLoading = true;

      const rbParam: RequestBuilderParams = { isProxy: true };

      const rb = new UserRequestBuilder(rbParam);
      const userAction = new User(rb);
      const resp = await userAction.deactiveAdminRole({ userId });
      if (resp.type === EN_REQUEST_RESULT.ERROR) {
        return false;
      }
      return runInAction(() => {
        this.isLoading = false;
        return true;
      });
    } catch (error) {
      this.isLoading = false;
      throw error;
    }
  }
}
