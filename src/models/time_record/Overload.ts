import debug from 'debug';

import RequestService from '../../services/requestService';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { IJSONSchemaType } from '../common/IJSONSchemaType';
import { AddFuseOverloadRequestParam } from './interface/AddFuseOverloadRequestParam';
import { IFuseOverWork, IFuseOverWorks, IOverWork, IOverWorks } from './interface/IOverWork';
import { IAddTimeRecord } from './interface/ITimeRecords';
import { OverloadsRequestParam } from './interface/OverloadsRequestParam';
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
    const response = await requester.call<
    IOverWork[]
    >(query);

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
    const response = await requester.call<
    IFuseOverWork[]
    >(query);

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
    const validParam = Requester.validateParam(params, schema);
    console.log(validParam);
    log('validParam: ', validParam);
    if (validParam === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: { text: null } };
    }
    const query = this.rb.createPostUserFuseOverloadQuery({
      method: 'POST',
      headers: {},
      body: params.body
    });

    log(query);

    const requester = RequestService.create(query.url);
    const response = await requester.call<{text: string | null}>(query);

    const result = await response;
    log('addFuseLog result.statusCode: ', result.statusCode);
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: { text: null } };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }
}