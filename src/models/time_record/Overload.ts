import debug from 'debug';

import RequestService from '../../services/requestService';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { IJSONSchemaType } from '../common/IJSONSchemaType';
import { AddFuseOverloadRequestParam } from './interface/AddFuseOverloadRequestParam';
import {
  IFuseOverWork,
  IFuseOverWorks,
  IOverWork,
  IOverWorks,
  IOverWorkWithType
} from './interface/IOverWork';
import { IAddTimeRecord } from './interface/ITimeRecords';
import {
  OverLoadByUserIDWithDateQueryRequestParam,
  OverLoadByUserIDWithDateRequestParam,
  OverloadsByUserIDRequestParam,
  OverloadsRequestParam
} from './interface/OverloadsRequestParam';
import { OverloadRequestBuilder } from './OverloadRequestBuilder';

const log = debug('trv:Overload');

export class Overload {
  constructor(private rb: OverloadRequestBuilder) {}

  public async findAll(
    params: OverloadsRequestParam,
    schema: IJSONSchemaType
  ): Promise<IOverWorks> {
    log(params);
    const validParam = Requester.validateParam(params, schema);
    log('validParam: ', validParam);
    if (validParam === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: [] };
    }
    const query = this.rb.createGetUserOverloadsQuery({
      method: 'GET',
      headers: {},
      query: params.query
    });

    log(query);

    const requester = RequestService.create(query.url);
    const response = await requester.call<IOverWork[]>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: [] };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async findAllFuse(
    params: OverloadsRequestParam,
    schema: IJSONSchemaType
  ): Promise<IFuseOverWorks> {
    log(params);
    const validParam = Requester.validateParam(params, schema);
    log('validParam: ', validParam);
    if (validParam === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: [] };
    }
    const query = this.rb.createGetUserFuseOverloadsQuery({
      method: 'GET',
      headers: {},
      query: params.query
    });

    log(query);

    const requester = RequestService.create(query.url);
    const response = await requester.call<IFuseOverWork[]>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: [] };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async findAllByUserID(
    params: OverloadsByUserIDRequestParam,
    schema: IJSONSchemaType
  ): Promise<IOverWorks> {
    log(params);
    const validParam = Requester.validateParam(params, schema);
    log('validParam: ', validParam);
    if (validParam === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: [] };
    }
    const query = this.rb.createGetUserByUserIDOverloadsQuery({
      method: 'GET',
      headers: {},
      query: params.query
    });

    log(query);

    const requester = RequestService.create(query.url);
    const response = await requester.call<IOverWork[]>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: [] };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async findByUserIdWithDate(
    params: OverLoadByUserIDWithDateRequestParam &
      OverLoadByUserIDWithDateQueryRequestParam,
    schema: IJSONSchemaType
  ): Promise<IOverWorkWithType> {
    log(params);
    const validParam = Requester.validateParam(params, schema);
    log('validParam: ', validParam);
    if (validParam === false) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }
    const query = this.rb.createGetUserOverloadByUserIDQuery({
      method: 'GET',
      headers: {},
      query: params.query,
      resources: {
        target_date: params.target_date
      }
    });

    log(query);

    const requester = RequestService.create(query.url);
    const response = await requester.call<IOverWork>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR || result.statusCode !== 200) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }
    log(result);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  /** 특정 사용자의 초과근무 내역 조회 */
  public async findAllFuseUserID(
    params: OverloadsByUserIDRequestParam,
    schema: IJSONSchemaType
  ): Promise<IFuseOverWorks> {
    log(params);
    const validParam = Requester.validateParam(params, schema);
    log('validParam: ', validParam);
    if (validParam === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: [] };
    }
    const query = this.rb.createGetUserFuseOverloadsByUserIDQuery({
      method: 'GET',
      headers: {},
      query: params.query
    });

    log(query);

    const requester = RequestService.create(query.url);
    const response = await requester.call<IFuseOverWork[]>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: [] };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async addFuseLog(
    params: AddFuseOverloadRequestParam,
    schema: IJSONSchemaType
  ): Promise<IAddTimeRecord> {
    log(params);
    const validParam = Requester.validateParamWithData(params, schema);
    log('addFuseLog validParam: ', validParam);

    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: { text: null } };
    }
    const query = this.rb.createPostUserFuseOverloadQuery({
      method: 'POST',
      headers: {},
      body: params.body
    });

    log(query);

    const requester = RequestService.create(query.url);
    const response = await requester.call<{ text: string | null }>(query);

    const result = await response;
    log('addFuseLog result.statusCode: ', result.statusCode);
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: { text: null } };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }
}
