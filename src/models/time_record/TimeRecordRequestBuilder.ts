import { RequestParams } from '../../services/requestService/interface/IRequestParams';
import {
  RequestBuilder,
  RequestBuilderParams
} from '../../services/requestService/RequestBuilder';
import { IAxiosRequesterConfig } from '../../services/requestService/requesters/AxiosRequester';
import {
  AddOverloadRecordByGroupReqParam,
  AddOverloadRecordReqParam
} from './interface/AddOverloadRecordReqParam';
import {
  AddTimeRecordRequestParam,
  RemoveTimeRecordRequestParam
} from './interface/AddTimeRecordRequestParam';
import { GetHolidaysParam } from './interface/GetHolidaysParam';
import { TimeRecordRecordsRequestsParam } from './interface/TimeRecordRecordsRequestsParam';
import { UpdateTimeRecordRequestParam } from './interface/UpdateTimeRecordRequestParam';

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

  public createPostUserRecordQuery({
    method,
    body
  }: RequestParams<{}, AddTimeRecordRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/work_log');
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

  public deleteUserRecordQuery({
    method,
    body
  }: RequestParams<{}, RemoveTimeRecordRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/work_log');
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

  public createPostUpdateUserRecordQuery({
    method,
    body
  }: RequestParams<{}, UpdateTimeRecordRequestParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/update_record');
    const endPoint = apiPath.href();
    const data = {
      auth_user_id: '',
      user_id: '',
      update_date: '',
      record_key: '',
      target_key: '',
      time: ''
    };
    if (!!body) {
      data.auth_user_id = body.auth_user_id;
      data.user_id = body.user_id;
      data.update_date = body.update_date;
      data.record_key = body.record_key;
      data.target_key = body.target_key;
      data.time = body.time;
    }

    return {
      method,
      data,
      headers: {
        ...this.AccessTokenObject
      },
      timeout: 10000,
      url: endPoint
    };
  }

  public getHolidaysQuery({
    method,
    query
  }: RequestParams<{}, GetHolidaysParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/holidays');
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

  public postOverWorkQuery({
    method,
    body
  }: RequestParams<{}, AddOverloadRecordReqParam>): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/over_work/sync');
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

  public postOverWorkByGroupQuery({
    method,
    body
  }: RequestParams<
    {},
    AddOverloadRecordByGroupReqParam
  >): IAxiosRequesterConfig {
    const apiPath = this.getAPIPath('/over_works/sync_for_workers');
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
}
