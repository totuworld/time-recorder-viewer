import { RequestParams } from '../../services/requestService/interface/IRequestParams';
import {
  RequestBuilder,
  RequestBuilderParams
} from '../../services/requestService/RequestBuilder';
import { IAxiosRequesterConfig } from '../../services/requestService/requesters/AxiosRequester';
import { AddFuseOverloadRequestParam } from './interface/AddFuseOverloadRequestParam';
import {
  DeleteOverloadByUserIDRequestParam,
  OverLoadByUserIDWithDateQueryRequestParam,
  OverLoadByUserIDWithDateRequestParam,
  OverloadsByUserIDRequestParam,
  OverloadsRequestParam
} from './interface/OverloadsRequestParam';
import { PutDisableExpiredFuseToVacationReqParam } from './interface/PutDisableExpiredFuseToVacationReqParam';
import { UseFuseToVacationRequestParam } from './interface/UseFuseToVacationRequestParam';

export class OverloadRequestBuilder extends RequestBuilder {
  constructor(queryParams?: RequestBuilderParams) {
    super(queryParams);
  }

  public getAPIPath(path: string) {
    const pathname = path.startsWith('/') ? path : `/${path}`;

    return this.baseURI.equals('') || this.isProxy
      ? this.baseURI.path(`/api${pathname}`)
      : this.baseURI.path(pathname);
  }

  public createGetUserOverloadsQuery({
    method,
    query
  }: RequestParams<{}, OverloadsRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/over_works');
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
      timeout: 10000,
      url: endPoint
    };
  }

  public createGetUserByUserIDOverloadsQuery({
    method,
    query
  }: RequestParams<{}, OverloadsByUserIDRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/over_works_by_user_id');
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
      timeout: 10000,
      url: endPoint
    };
  }

  /** 특정 사용자, 특정 주.. 추가근무 시간 정산 내역 조회 */
  public createGetUserOverloadByUserIDQuery({
    method,
    query,
    resources
  }: RequestParams<
    OverLoadByUserIDWithDateRequestParam,
    OverLoadByUserIDWithDateQueryRequestParam
  >): IAxiosRequesterConfig {
    const { target_date } = resources!;
    const apiPath = this.getAPIPath(`/over_work/${target_date}`);
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
      timeout: 10000,
      url: endPoint
    };
  }

  public createGetUserFuseOverloadsQuery({
    method,
    query
  }: RequestParams<{}, OverloadsRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/fuse_over_works');
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
      timeout: 10000,
      url: endPoint
    };
  }

  public createGetUserFuseOverloadsByUserIDQuery({
    method,
    query
  }: RequestParams<{}, OverloadsByUserIDRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/fuse_over_works_by_user_id');
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
      timeout: 10000,
      url: endPoint
    };
  }

  public createPostUserFuseOverloadQuery({
    method,
    query,
    body
  }: RequestParams<{}, AddFuseOverloadRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/fuse_over_work');
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
      data: body,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 10000,
      url: endPoint
    };
  }

  public useFuseToVacationQuery({
    method,
    query,
    body
  }: RequestParams<{}, UseFuseToVacationRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/use_fuse_over_work_to_vacation');
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
      data: body,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 10000,
      url: endPoint
    };
  }

  public findAllFuseToVacationByUserIDQuery({
    method,
    resources
  }: RequestParams<{ user_id: string }, {}>) {
    const apiPath = this.getAPIPath(
      `/fuse_over_work_to_vacations/${resources!.user_id}`
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

  public convertVacationByGroupIDQuery({
    method,
    resources,
    body
  }: RequestParams<
    { group_id: string },
    {
      body: {
        expireDate: string;
        note: string;
        auth_id: string;
      };
    }
  >) {
    const apiPath = this.getAPIPath(
      `/fuse_over_work_to_vacation/${resources!.group_id}`
    );
    const endPoint = apiPath.href();

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 60000,
      url: endPoint,
      data: body
    };
  }

  public disableExpiredFuseToVacationByGroupIDQuery({
    method,
    resources,
    body
  }: RequestParams<
    { group_id: string },
    {
      body: {
        expireDate: string;
        expireNote: string;
        auth_id: string;
      };
    }
  >) {
    const apiPath = this.getAPIPath(
      `/disable_fuse_over_work_to_vacation/${resources!.group_id}`
    );
    const endPoint = apiPath.href();

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 20000,
      url: endPoint,
      data: body
    };
  }

  /** 특정 사용자, 특정 주.. 추가근무 시간 정산 내역 삭제 */
  public deleteOverloadByUserIDQuery({
    method,
    body
  }: RequestParams<
    {},
    DeleteOverloadByUserIDRequestParam
  >): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/over_work');
    const endPoint = apiPath.href();

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      data: body,
      timeout: 10000,
      url: endPoint
    };
  }
}
