import debug from 'debug';

import RequestService from '../../services/requestService';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { IJSONSchemaType } from '../common/IJSONSchemaType';
import { IUserInfo } from '../user/interface/IUserInfo';
import { EventRequestBuilder } from './EventRequestBuilder';
import { AddEventReqParam } from './interface/AddEventReqParam';
import { AddOrderReqParam } from './interface/AddOrderReqParam';
import { FindAllEventsReqParam } from './interface/FindAllEventsReqParam';
import { FindEventReqParam } from './interface/FindEventReqParam';
import { IEvent } from './interface/IEvent';
import { IEventOrder } from './interface/IEventOrder';
import { RemoveOrderReqParam } from './interface/RemoveOrderReqParam';
import { SendMsgToGuestsReqParam } from './interface/SendMsgToGuestsReqParam';

const log = debug('trv:model:Event');

export class Event {
  constructor(private rb: EventRequestBuilder) {}

  public async findAllEvent(
    params: FindAllEventsReqParam,
    schema: IJSONSchemaType
  ) {
    const validParam = Requester.validateParamWithData<FindAllEventsReqParam>(
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

  public async findEvent(params: FindEventReqParam, schema: IJSONSchemaType) {
    const validParam = Requester.validateParamWithData<FindEventReqParam>(
      params,
      schema
    );
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.findEventQuery({
      method: 'GET',
      headers: {},
      resources: {
        eventId: params.params.event_id
      }
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

  public async findGuests(params: FindEventReqParam, schema: IJSONSchemaType) {
    const validParam = Requester.validateParamWithData<FindEventReqParam>(
      params,
      schema
    );
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.findEventGuestsQuery({
      method: 'GET',
      headers: {},
      resources: {
        eventId: params.params.event_id
      }
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IUserInfo[]>(query);

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

  public async closeEvent(params: FindEventReqParam, schema: IJSONSchemaType) {
    const validParam = Requester.validateParamWithData<FindEventReqParam>(
      params,
      schema
    );
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.updateEventQuery({
      method: 'PUT',
      headers: {},
      body: {
        closed: true
      },
      resources: {
        eventId: params.params.event_id
      }
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

  public async orders(params: FindEventReqParam, schema: IJSONSchemaType) {
    const validParam = Requester.validateParamWithData<FindEventReqParam>(
      params,
      schema
    );
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.findEventOrdersQuery({
      method: 'GET',
      headers: {},
      resources: {
        eventId: params.params.event_id
      }
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IEventOrder[]>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async addOrder(params: AddOrderReqParam, schema: IJSONSchemaType) {
    const validParam = Requester.validateParamWithData<AddOrderReqParam>(
      params,
      schema
    );
    log('addOrder validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.addEventOrderQuery({
      method: 'POST',
      headers: {},
      resources: validParam.data.params,
      body: validParam.data.body
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IEventOrder>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  public async deleteOrder(
    params: RemoveOrderReqParam,
    schema: IJSONSchemaType
  ) {
    const validParam = Requester.validateParamWithData<RemoveOrderReqParam>(
      params,
      schema
    );
    log('deleteOrder validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }

    const query = this.rb.removeEventOrderQuery({
      method: 'DELETE',
      headers: {},
      resources: validParam.data.params
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<{}>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS };
  }

  public async sendMsgToGuests(
    params: SendMsgToGuestsReqParam,
    schema: IJSONSchemaType
  ) {
    const validParam = Requester.validateParamWithData<SendMsgToGuestsReqParam>(
      params,
      schema
    );
    log('sendMsgToGuests validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    const query = this.rb.sendMsgToGuestsQuery({
      method: 'POST',
      headers: {},
      resources: validParam.data.params,
      query: validParam.data.query
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<{}>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: null };
  }
}
