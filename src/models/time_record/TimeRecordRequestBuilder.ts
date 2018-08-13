import * as URI from 'urijs';

import { RequestParams } from '../../services/requestService/interface/IRequestParams';
import { RequestBuilder, RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { IAxiosRequesterConfig } from '../../services/requestService/requesters/AxiosRequester';
import { AddTimeRecordRequestParam } from './interface/AddTimeRecordRequestParam';
import { TimeRecordRecordsRequestsParam } from './interface/TimeRecordRecordsRequestsParam';

export class TimeRecordRequestBuilder extends RequestBuilder {
  constructor(queryParams?: RequestBuilderParams) {
    super(queryParams);
  }

  public getAPIPath(path: string) {
    const pathname = path.startsWith('/') ? path : `/${path}`;

    return this.baseURI.equals('') || this.isProxy
      ? this.baseURI.path(`/api${pathname}`)
      : this.baseURI.path(pathname);
  }

  public createGetUserRecordsQuery({
    method,
    query
  }: RequestParams<{}, TimeRecordRecordsRequestsParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/get_all');
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
      timeout: 10000,
      url: endPoint,
    };
  }

  public createPostUserRecordQuery({
    method,
    body
  }: RequestParams<{}, AddTimeRecordRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/command_ping');
    const endPoint = apiPath.href();
    const data = { user_id: '', text: '' };
    if (!!body) {
      data.user_id = body.user_id;
      data.text = body.text;
    }

    return {
      method,
      data,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 10000,
      url: endPoint,
    };
  }
}
