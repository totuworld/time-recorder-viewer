import * as URI from 'urijs';

import { RequestParams } from '../../services/requestService/interface/IRequestParams';
import {
  RequestBuilder,
  RequestBuilderParams
} from '../../services/requestService/RequestBuilder';
import { IAxiosRequesterConfig } from '../../services/requestService/requesters/AxiosRequester';
import { AddLoginUserRequestParam } from './interface/AddLoginUserRequestParam';
import {
  AddQueueRequestBodyParam,
  AddQueueRequestParam
} from './interface/AddQueueRequestParam';
import { DeleteQueueRequestParam } from './interface/DeleteQueueRequestParam';
import { FindQueueRequestParam } from './interface/FindQueueRequestParam';
import { GroupsFindRequestParam } from './interface/GroupsFindRequestParam';
import { LoginUserRequestParam } from './interface/LoginUserRequestParam';
import { UserFindRequestParam } from './interface/UserFindRequestParam';

export class UserRequestBuilder extends RequestBuilder {
  constructor(queryParams?: RequestBuilderParams) {
    super(queryParams);
  }

  public getAPIPath(path: string) {
    const pathname = path.startsWith('/') ? path : `/${path}`;

    return this.baseURI.equals('') || this.isProxy
      ? this.baseURI.path(`/api${pathname}`)
      : this.baseURI.path(pathname);
  }

  public createGetUserInfoQuery({
    method,
    query
  }: RequestParams<{}, UserFindRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/get_user');
    let endPoint = apiPath.href();
    if (!!query) {
      const reqQueryStr = Object.keys(query)
        .reduce((acc: string[], cur) => {
          if (!!query[cur]) {
            acc.push(`${cur}=${query[cur]}`);
          }
          return acc;
        }, [])
        .join('&');
      endPoint = `${endPoint}?${reqQueryStr}`;
    }

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 20000,
      url: endPoint
    };
  }

  public createGetGroupsQuery({
    method,
    query
  }: RequestParams<{}, GroupsFindRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/get_groups');
    let endPoint = apiPath.href();
    if (!!query) {
      const reqQueryStr = Object.keys(query)
        .reduce((acc: string[], cur) => {
          if (!!query[cur]) {
            acc.push(`${cur}=${query[cur]}`);
          }
          return acc;
        }, [])
        .join('&');
      endPoint = `${endPoint}?${reqQueryStr}`;
    }

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 20000,
      url: endPoint
    };
  }

  public createPostLoginUserQuery({
    method,
    body
  }: RequestParams<{}, AddLoginUserRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/add_login_user');
    const endPoint = apiPath.href();
    const data = { userUid: '', email: '' };
    if (!!body) {
      data.userUid = body.userUid;
      data.email = body.email;
    }

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      data,
      timeout: 20000,
      url: endPoint
    };
  }

  public createGetLoginUserInfoQuery({
    method,
    resources
  }: RequestParams<LoginUserRequestParam, {}>): IAxiosRequesterConfig {
    const { user_uid } = resources!;
    const apiPath = this.getAPIPath(`/login_user/${user_uid}`);

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 5000,
      url: apiPath.href()
    };
  }

  public getAllSlackUserInfosQuery({
    method
  }: RequestParams<{}, {}>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/slack_users');
    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 10000,
      url: apiPath.href()
    };
  }

  /** 사용자 queue 조회 */
  public readUserQueueQuery({
    method,
    resources
  }: RequestParams<FindQueueRequestParam, {}>): IAxiosRequesterConfig {
    const { authId } = resources!;
    const apiPath = this.getAPIPath(`/get_user/${authId}/queue`);

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 10000,
      url: apiPath.href()
    };
  }

  public addUserQueueQuery({
    method,
    resources,
    body
  }: RequestParams<
    AddQueueRequestParam,
    AddQueueRequestBodyParam
  >): IAxiosRequesterConfig {
    const { userId } = resources!;
    const apiPath = this.getAPIPath(`/get_user/${userId}/queue`);

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      data: body,
      timeout: 10000,
      url: apiPath.href()
    };
  }

  public deleteUserQueueQuery({
    method,
    resources
  }: RequestParams<DeleteQueueRequestParam, {}>): IAxiosRequesterConfig {
    const { authId, key } = resources!;
    const apiPath = this.getAPIPath(`/get_user/${authId}/queue/${key}`);

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 10000,
      url: apiPath.href()
    };
  }

  public activeAdminRoleQuery({
    method,
    resources
  }: RequestParams<{ user_id: string }, {}>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath(`/active_admin_role/${resources?.user_id}`);
    const endPoint = apiPath.href();

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 20000,
      url: endPoint
    };
  }

  public deactiveAdminRoleQuery({
    method,
    resources
  }: RequestParams<{ user_id: string }, {}>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath(
      `/deactive_admin_role/${resources?.user_id}`
    );
    const endPoint = apiPath.href();

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 20000,
      url: endPoint
    };
  }
}
