import debug from 'debug';

import RequestService from '../../services/requestService';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { IJSONSchemaType } from '../common/IJSONSchemaType';
import { IOverWork, IOverWorks } from './interface/IOverWork';
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
}