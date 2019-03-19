import * as debug from 'debug';

import { RequestParams } from '../../services/requestService/interface/IRequestParams';
import {
  RequestBuilder,
  RequestBuilderParams
} from '../../services/requestService/RequestBuilder';
import { AddBeverageReqParam } from './interface/AddBeverageReqParam';
import { FindAllBeverageReqParam } from './interface/FindAllBeverageReqParam';

const log = debug('trv:BeverageRequestBuilder');

export class BeverageRequestBuilder extends RequestBuilder {
  constructor(queryParams?: RequestBuilderParams) {
    super(queryParams);
  }

  public getAPIPath(path: string) {
    const pathname = path.startsWith('/') ? path : `/${path}`;

    return this.baseURI.equals('') || this.isProxy
      ? this.baseURI.path(`/api${pathname}`)
      : this.baseURI.path(pathname);
  }

  public findAllBeveragesQuery({
    method,
    query
  }: RequestParams<{}, FindAllBeverageReqParam>) {
    const apiPath = this.getAPIPath('/beverages');
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

  public addBeverageQuery({
    method,
    body
  }: RequestParams<{}, AddBeverageReqParam>) {
    const apiPath = this.getAPIPath('/beverages');
    const endPoint = apiPath.href();

    log('addBeverageQuery: ', body);

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
}
