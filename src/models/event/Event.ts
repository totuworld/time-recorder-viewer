import debug from 'debug';

import RequestService from '../../services/requestService';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { IJSONSchemaType } from '../common/IJSONSchemaType';
import { EventRequestBuilder } from './EventRequestBuilder';
import { AddEventReqParam } from './interface/AddEventReqParam';
import { FindAllEventsReqParma } from './interface/FindAllEventsReqParma';
import { IEvent } from './interface/IEvent';

const log = debug('trv:model:Event');

export class Event {
  constructor(private rb: EventRequestBuilder) {}

  public async findAllEvent(
    params: FindAllEventsReqParma,
    schema: IJSONSchemaType
  ) {
    const validParam = Requester.validateParamWithData<FindAllEventsReqParma>(
      params,
      schema
    );
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.findAllEventsQuery({
      method: 'GET',
      headers: {},
      query: params.query
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IEvent[]>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async addEvent(params: AddEventReqParam, schema: IJSONSchemaType) {
    const validParam = Requester.validateParamWithData<AddEventReqParam>(
      params,
      schema
    );
    log('addEvent validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.addEventQuery({
      method: 'POST',
      headers: {},
      ...validParam.data
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IEvent>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }
}
