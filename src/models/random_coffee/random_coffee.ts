import debug from 'debug';

import RequestService from '../../services/requestService';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { IJSONSchemaType } from '../common/IJSONSchemaType';
import { FindAllEventsReqParam } from '../event/interface/FindAllEventsReqParam';
import { FindEventReqParam } from '../event/interface/FindEventReqParam';
import { IUserInfo } from '../user/interface/IUserInfo';
import { AddRCEventGuestsReqParam } from './interface/AddRCEventGuestsReqParam';
import { AddRCEventReqParam } from './interface/AddRCEventReqParam';
import { DelRCEventGuestReq } from './interface/DelRCEventGuestReqParam';
import { IRandomCoffeeEvent } from './interface/IRandomCoffeeEvent';
import { UpdateRCEventReqParam } from './interface/UpdateRCEventReqParam';
import { RandomCoffeeRequestBuilder } from './random_coffee.rb';

const log = debug('trv:model:RandomCoffee');

export class RandomCoffee {
  constructor(private rb: RandomCoffeeRequestBuilder) {}

  /** 모든 이벤트 찾기 */
  public async findAll(params: FindAllEventsReqParam, schema: IJSONSchemaType) {
    const validParam = Requester.validateParamWithData<FindAllEventsReqParam>(
      params,
      schema
    );
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.findAllQuery({
      method: 'GET',
      headers: {},
      query: params.query
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IRandomCoffeeEvent[]>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  /** 이벤트 단건 찾기 */
  public async find(params: FindEventReqParam, schema: IJSONSchemaType) {
    const validParam = Requester.validateParamWithData<FindEventReqParam>(
      params,
      schema
    );
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.findQuery({
      method: 'GET',
      headers: {},
      resources: {
        eventId: params.params.event_id
      }
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IRandomCoffeeEvent>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  /** 이벤트 등록 */
  public async add(params: AddRCEventReqParam, schema: IJSONSchemaType) {
    const validParam = Requester.validateParamWithData<AddRCEventReqParam>(
      params,
      schema
    );
    log('add validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.addQuery({
      method: 'POST',
      headers: {},
      ...validParam.data
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IRandomCoffeeEvent>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  /** 이벤트 수정 */
  public async update(params: UpdateRCEventReqParam, schema: IJSONSchemaType) {
    const validParam = Requester.validateParamWithData<UpdateRCEventReqParam>(
      params,
      schema
    );
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.updateQuery({
      method: 'PUT',
      headers: {},
      body: params.body,
      resources: {
        eventId: params.params.eventId
      }
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<IRandomCoffeeEvent>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }

  /** 이벤트 게스트, 목록 */
  public async findGuests(params: FindEventReqParam, schema: IJSONSchemaType) {
    const validParam = Requester.validateParamWithData<FindEventReqParam>(
      params,
      schema
    );
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.findGuestsQuery({
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

  /** 이벤트 게스트, 추가 */
  public async addGuests(
    params: AddRCEventGuestsReqParam,
    schema: IJSONSchemaType
  ) {
    const validParam = Requester.validateParamWithData<
      AddRCEventGuestsReqParam
    >(params, schema);
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.addGuestsQuery({
      method: 'POST',
      headers: {},
      body: params.body,
      resources: {
        eventId: params.params.eventId
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

  /** 이벤트 게스트, 삭제 */
  public async delGuest(params: DelRCEventGuestReq, schema: IJSONSchemaType) {
    const validParam = Requester.validateParamWithData<DelRCEventGuestReq>(
      params,
      schema
    );
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.delGuestQuery({
      method: 'DELETE',
      headers: {},
      resources: {
        eventId: params.params.eventId,
        userId: params.params.docId
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

  public async checkGuestRegister(
    params: DelRCEventGuestReq,
    schema: IJSONSchemaType
  ) {
    const validParam = Requester.validateParamWithData<DelRCEventGuestReq>(
      params,
      schema
    );
    log('validParam: ', validParam.result);
    if (validParam.result === false) {
      return { type: EN_REQUEST_RESULT.ERROR, data: null };
    }

    const query = this.rb.checkGuestRegisterQuery({
      method: 'GET',
      headers: {},
      resources: {
        eventId: params.params.eventId,
        docId: params.params.docId
      }
    });
    const requester = RequestService.create(query.url);
    const response = await requester.call<{ result: boolean }>(query);

    const result = await response;
    if (result.type === EN_REQUEST_RESULT.ERROR) {
      return { type: EN_REQUEST_RESULT.ERROR, data: { result: false } };
    }
    log(result.payload);
    return { type: EN_REQUEST_RESULT.SUCCESS, data: result.payload };
  }
}
