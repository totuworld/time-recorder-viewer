import { Request } from 'express';

import { Config } from '../../config/Config';
import { Event } from '../../models/event/Event';
import { EventRequestBuilder } from '../../models/event/EventRequestBuilder';
import { AddEventReqParam } from '../../models/event/interface/AddEventReqParam';
import { FindAllEventsReqParma } from '../../models/event/interface/FindAllEventsReqParma';
import { IEvent } from '../../models/event/interface/IEvent';
import { JSCAddEvent } from '../../models/event/JSONSchema/JSCAddEvent';
import { JSCFindAllEvent } from '../../models/event/JSONSchema/JSCFindAllEvent';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { TControllerResp } from './ICommonController';

export class EventController {
  public async findAllEvent(req: Request): Promise<TControllerResp<IEvent[]>> {
    const validateReq = Requester.validateParamWithData<FindAllEventsReqParma>(
      {
        query: req.query
      },
      JSCFindAllEvent
    );
    if (validateReq.result === false) {
      return {
        status: 400,
        payload: validateReq.errorMessage
      };
    }
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new EventRequestBuilder(rbParam);
    const findAction = new Event(rb);

    const actionResp = await findAction.findAllEvent(
      validateReq.data,
      JSCFindAllEvent
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 204 : 200,
      payload: actionResp.data
    };
  }

  public async addEvent(req: Request): Promise<TControllerResp<IEvent>> {
    const validateReq = Requester.validateParamWithData<AddEventReqParam>(
      {
        body: req.body
      },
      JSCAddEvent
    );
    if (validateReq.result === false) {
      return {
        status: 400,
        payload: validateReq.errorMessage
      };
    }
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new EventRequestBuilder(rbParam);
    const findAction = new Event(rb);

    const actionResp = await findAction.addEvent(
      validateReq.data,
      JSCFindAllEvent
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }
}
