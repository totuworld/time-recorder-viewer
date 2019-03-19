import { Request } from 'express';

import { Config } from '../../config/Config';
import { Event } from '../../models/event/Event';
import { EventRequestBuilder } from '../../models/event/EventRequestBuilder';
import { AddEventReqParam } from '../../models/event/interface/AddEventReqParam';
import { AddOrderReqParam } from '../../models/event/interface/AddOrderReqParam';
import { FindAllEventsReqParam } from '../../models/event/interface/FindAllEventsReqParam';
import { FindEventReqParam } from '../../models/event/interface/FindEventReqParam';
import { IEvent } from '../../models/event/interface/IEvent';
import { IEventOrder } from '../../models/event/interface/IEventOrder';
import { SendMsgToGuestsReqParam } from '../../models/event/interface/SendMsgToGuestsReqParam';
import { JSCAddEvent } from '../../models/event/JSONSchema/JSCAddEvent';
import { JSCAddOrder } from '../../models/event/JSONSchema/JSCAddOrder';
import { JSCFindAllEvent } from '../../models/event/JSONSchema/JSCFindAllEvent';
import { JSCFindEvent } from '../../models/event/JSONSchema/JSCFindEvent';
import { JSCSendMsgToGuests } from '../../models/event/JSONSchema/JSCSendMsgToGuests';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { TControllerResp } from './ICommonController';

export class EventController {
  public async findAllEvent(req: Request): Promise<TControllerResp<IEvent[]>> {
    const validateReq = Requester.validateParamWithData<FindAllEventsReqParam>(
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

  public async findEvent(req: Request): Promise<TControllerResp<IEvent>> {
    const validateReq = Requester.validateParamWithData<FindEventReqParam>(
      {
        params: req.params
      },
      JSCFindEvent
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

    const actionResp = await findAction.findEvent(
      validateReq.data,
      JSCFindEvent
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 204 : 200,
      payload: actionResp.data
    };
  }

  public async findEventGuests(req: Request): Promise<TControllerResp<IEvent>> {
    const validateReq = Requester.validateParamWithData<FindEventReqParam>(
      {
        params: req.params
      },
      JSCFindEvent
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

    const actionResp = await findAction.findGuests(
      validateReq.data,
      JSCFindEvent
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

    const actionResp = await findAction.addEvent(validateReq.data, JSCAddEvent);

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  public async closeEvent(req: Request): Promise<TControllerResp<IEvent>> {
    const validateReq = Requester.validateParamWithData<FindEventReqParam>(
      {
        params: req.params
      },
      JSCFindEvent
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

    const actionResp = await findAction.closeEvent(
      validateReq.data,
      JSCFindEvent
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 204 : 200,
      payload: actionResp.data
    };
  }

  public async orders(req: Request): Promise<TControllerResp<IEventOrder>> {
    const validateReq = Requester.validateParamWithData<FindEventReqParam>(
      {
        params: req.params
      },
      JSCFindEvent
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

    const actionResp = await findAction.orders(validateReq.data, JSCFindEvent);

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 204 : 200,
      payload: actionResp.data
    };
  }

  public async addOrder(req: Request): Promise<TControllerResp<IEventOrder>> {
    const validateReq = Requester.validateParamWithData<AddOrderReqParam>(
      {
        body: req.body,
        params: req.params
      },
      JSCAddOrder
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

    const actionResp = await findAction.addOrder(
      { ...validateReq.data },
      JSCAddOrder
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  public async sendMsgToGuests(req: Request): Promise<TControllerResp<{}>> {
    const validateReq = Requester.validateParamWithData<
      SendMsgToGuestsReqParam
    >(
      {
        query: req.query,
        params: req.params
      },
      JSCSendMsgToGuests
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

    const actionResp = await findAction.sendMsgToGuests(
      {
        ...validateReq.data,
        query: { text: encodeURIComponent(validateReq.data.query.text) }
      },
      JSCSendMsgToGuests
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }
}
