import debug from 'debug';

import RequestService from '../../services/requestService';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { IJSONSchemaType } from '../common/IJSONSchemaType';
import { BeverageRequestBuilder } from './BeverageRequestBuilder';
import { AddBeverageReqParam } from './interface/AddBeverageReqParam';
import { FindAllBeverageReqParam } from './interface/FindAllBeverageReqParam';
import { IBeverage } from './interface/IBeverage';

const log = debug('trv:Beverage');

export class Beverage {
  constructor(private rb: BeverageRequestBuilder) {}

  public async findAll(
    params: FindAllBeverageReqParam,
    schema: IJSONSchemaType
  ) {
    const validParam = Requester.validateParamWithData<FindAllBeverageReqParam>(
      params,
      schema
    );
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }

    const query = this.rb.findAllBeveragesQuery({
      method: 'GET',
      headers: {},
      query: validParam.data.query
    });
    const requester = RequestService.create(query.url);
    const result = await requester.call<IBeverage[]>(query);

    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async add(params: AddBeverageReqParam, schema: IJSONSchemaType) {
    const validParam = Requester.validateParamWithData<AddBeverageReqParam>(
      params,
      schema
    );
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }

    const query = this.rb.addBeverageQuery({
      method: 'POST',
      headers: {},
      body: validParam.data.body
    });
    const requester = RequestService.create(query.url);
    const result = await requester.call<IBeverage>(query);

    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }
}
