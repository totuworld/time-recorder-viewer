import { RequestParams } from '../../services/requestService/interface/IRequestParams';
import { RequestBuilder, RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { IAxiosRequesterConfig } from '../../services/requestService/requesters/AxiosRequester';
import { OverloadsRequestParam } from './interface/OverloadsRequestParam';

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
}