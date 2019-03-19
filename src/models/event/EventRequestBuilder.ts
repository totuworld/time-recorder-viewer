import * as debug from 'debug';

import { RequestParams } from '../../services/requestService/interface/IRequestParams';
import {
  RequestBuilder,
  RequestBuilderParams
} from '../../services/requestService/RequestBuilder';
import { AddEventReqParam } from './interface/AddEventReqParam';
import { AddOrderReqParam } from './interface/AddOrderReqParam';
import { FindAllEventsReqParam } from './interface/FindAllEventsReqParam';
import { SendMsgToGuestsReqParam } from './interface/SendMsgToGuestsReqParam';
import { UpdateEventReqParam } from './interface/UpdateEventReqParam';

const log = debug('trv:EventRequestBuilder');

export class EventRequestBuilder extends RequestBuilder {
  constructor(queryParams?: RequestBuilderParams) {
    super(queryParams);
  }

  public getAPIPath(path: string) {
    const pathname = path.startsWith('/') ? path : `/${path}`;

    return this.baseURI.equals('') || this.isProxy
      ? this.baseURI.path(`/api${pathname}`)
      : this.baseURI.path(pathname);
  }

  public findAllEventsQuery({
    method,
    query
  }: RequestParams<{}, FindAllEventsReqParam>) {
    const apiPath = this.getAPIPath('/events');
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

  public findEventQuery({
    method,
    resources
  }: RequestParams<{ eventId: string }, {}>) {
    const apiPath = this.getAPIPath(`/events/${resources!.eventId}`);
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

  public findEventGuestsQuery({
    method,
    resources
  }: RequestParams<{ eventId: string }, {}>) {
    const apiPath = this.getAPIPath(`/events/${resources!.eventId}/guests`);
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

  public addEventQuery({ method, body }: RequestParams<{}, AddEventReqParam>) {
    const apiPath = this.getAPIPath('/events');
    const endPoint = apiPath.href();

    log('addEventQuery: ', body);

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

  public updateEventQuery({
    method,
    resources,
    body
  }: RequestParams<{ eventId: string }, UpdateEventReqParam>) {
    const { eventId } = resources!;
    const apiPath = this.getAPIPath(`/events/${eventId}`);
    const endPoint = apiPath.href();

    return {
      method,
      body,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 10000,
      url: endPoint
    };
  }

  public addEventOrderQuery({
    method,
    resources,
    body
  }: RequestParams<{ eventId: string }, AddOrderReqParam>) {
    const { eventId } = resources!;
    const apiPath = this.getAPIPath(`/events/${eventId}/orders`);
    const endPoint = apiPath.href();

    log('addEventOrderQuery: ', body);

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

  public findEventOrdersQuery({
    method,
    resources
  }: RequestParams<{ eventId: string }, {}>) {
    const apiPath = this.getAPIPath(`/events/${resources!.eventId}/orders`);
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

  public sendMsgToGuestsQuery({
    method,
    resources,
    query
  }: RequestParams<{ eventId: string }, SendMsgToGuestsReqParam>) {
    const apiPath = this.getAPIPath(`/events/${resources!.eventId}/guests/msg`);
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
}
