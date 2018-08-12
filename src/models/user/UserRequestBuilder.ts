import * as URI from 'urijs';

import { RequestParams } from '../../services/requestService/interface/IRequestParams';
import { RequestBuilder, RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { IAxiosRequesterConfig } from '../../services/requestService/requesters/AxiosRequester';
import { AddLoginUserRequestParam } from './interface/AddLoginUserRequestParam';
import { GroupsFindRequestParam } from './interface/GroupsFindRequestParam';
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
      const reqQueryStr = Object.keys(query).reduce(
        (acc: string[], cur) => {
          if (!!query[cur]) {
            acc.push(`${cur}=${query[cur]}`);
          }
          return acc;
        },
        []).join('&');
      endPoint = `${endPoint}?${reqQueryStr}`;
    }

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 20000,
      url: endPoint,
    };
  }

  public createGetGroupsQuery({
    method,
    query
  }: RequestParams<{}, GroupsFindRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/get_groups');
    let endPoint = apiPath.href();
    if (!!query) {
      const reqQueryStr = Object.keys(query).reduce(
        (acc: string[], cur) => {
          if (!!query[cur]) {
            acc.push(`${cur}=${query[cur]}`);
          }
          return acc;
        },
        []).join('&');
      endPoint = `${endPoint}?${reqQueryStr}`;
    }

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 20000,
      url: endPoint,
    };
  }

  public createPostLoginUserQuery({
    method,
    query
  }: RequestParams<{}, AddLoginUserRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/add_login_user');
    const endPoint = apiPath.href();
    const data = { userUid: '', email: '' };
    if (!!query) {
      data.userUid = query.userUid;
      data.email = query.email;
    }

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      data,
      timeout: 20000,
      url: endPoint,
    };
  }
}
