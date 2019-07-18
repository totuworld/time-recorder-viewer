import * as debug from 'debug';

import { RequestParams } from '../../services/requestService/interface/IRequestParams';
import {
  RequestBuilder,
  RequestBuilderParams
} from '../../services/requestService/RequestBuilder';
import { FindAllEventsReqParam } from '../event/interface/FindAllEventsReqParam';
import { AddRCEventGuestsReqParam } from './interface/AddRCEventGuestsReqParam';
import { AddRCEventReqParam } from './interface/AddRCEventReqParam';
import { UpdateRCEventReqParam } from './interface/UpdateRCEventReqParam';

const log = debug('trv:RandomCoffeeRequestBuilder');

export class RandomCoffeeRequestBuilder extends RequestBuilder {
  constructor(queryParams?: RequestBuilderParams) {
    super(queryParams);
  }

  public getAPIPath(path: string) {
    const pathname = path.startsWith('/') ? path : `/${path}`;

    return this.baseURI.equals('') || this.isProxy
      ? this.baseURI.path(`/api${pathname}`)
      : this.baseURI.path(pathname);
  }

  public findAllQuery({
    method,
    query
  }: RequestParams<{}, FindAllEventsReqParam>) {
    const apiPath = this.getAPIPath('/random_coffee');
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

    log('ho');

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 20000,
      url: endPoint
    };
  }

  public findQuery({
    method,
    resources
  }: RequestParams<{ eventId: string }, {}>) {
    const apiPath = this.getAPIPath(`/random_coffee/${resources!.eventId}`);
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

  public addQuery({ method, body }: RequestParams<{}, AddRCEventReqParam>) {
    const apiPath = this.getAPIPath('/random_coffee');
    const endPoint = apiPath.href();

    log('addQuery: ', body);

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

  public updateQuery({
    method,
    resources,
    body
  }: RequestParams<{ eventId: string }, UpdateRCEventReqParam>) {
    const { eventId } = resources!;
    const apiPath = this.getAPIPath(`/random_coffee/${eventId}`);
    const endPoint = apiPath.href();

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

  public findGuestsQuery({
    method,
    resources
  }: RequestParams<{ eventId: string }, {}>) {
    const apiPath = this.getAPIPath(
      `/random_coffee/${resources!.eventId}/guests`
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

  public addGuestsQuery({
    resources,
    method,
    body
  }: RequestParams<{ eventId: string }, AddRCEventGuestsReqParam>) {
    const apiPath = this.getAPIPath(
      `/random_coffee/${resources!.eventId}/guests`
    );
    const endPoint = apiPath.href();

    log('addGuestsQuery: ', body);

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

  public delGuestQuery({
    resources,
    method
  }: RequestParams<{ eventId: string; userId: string }>) {
    const apiPath = this.getAPIPath(
      `/random_coffee/${resources!.eventId}/guests/${resources!.userId}`
    );
    const endPoint = apiPath.href();

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 10000,
      url: endPoint
    };
  }

  public checkGuestRegisterQuery({
    resources,
    method
  }: RequestParams<{ eventId: string; docId: string }>) {
    const apiPath = this.getAPIPath(
      `/random_coffee/${resources!.eventId}/guests/${
        resources!.docId
      }/check_register`
    );
    const endPoint = apiPath.href();

    return {
      method,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 10000,
      url: endPoint
    };
  }
}
