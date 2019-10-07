import { Request } from 'express';

import { Config } from '../../config/Config';
import { FindAllEventsReqParam } from '../../models/event/interface/FindAllEventsReqParam';
import { FindEventReqParam } from '../../models/event/interface/FindEventReqParam';
import { JSCFindAllEvent } from '../../models/event/JSONSchema/JSCFindAllEvent';
import { JSCFindEvent } from '../../models/event/JSONSchema/JSCFindEvent';
import { AddRCEventGuestsReqParam } from '../../models/random_coffee/interface/AddRCEventGuestsReqParam';
import { AddRCEventReqParam } from '../../models/random_coffee/interface/AddRCEventReqParam';
import { DelRCEventGuestReq } from '../../models/random_coffee/interface/DelRCEventGuestReqParam';
import { IRandomCoffeeEvent } from '../../models/random_coffee/interface/IRandomCoffeeEvent';
import { UpdateRCEventReqParam } from '../../models/random_coffee/interface/UpdateRCEventReqParam';
import { JSCAddRCEvent } from '../../models/random_coffee/JSONSchema/JSCAddRCEvent';
import { JSCAddRCEventGuests } from '../../models/random_coffee/JSONSchema/JSCAddRCEventGuests';
import { JSCDelRCEventGuest } from '../../models/random_coffee/JSONSchema/JSCDelRCEventGuest';
import { JSCUpdateRCEvent } from '../../models/random_coffee/JSONSchema/JSCUpdateRCEvent';
import { RandomCoffee } from '../../models/random_coffee/random_coffee';
import { RandomCoffeeRequestBuilder } from '../../models/random_coffee/random_coffee.rb';
import { IUserInfo } from '../../models/user/interface/IUserInfo';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { Requester } from '../../services/requestService/Requester';
import {
  EN_REQUEST_RESULT,
  ENREQUEST_ERRORS
} from '../../services/requestService/requesters/AxiosRequester';
import { TControllerResp } from './ICommonController';

export class RandomCoffeeController {
  public async findAll(
    req: Request
  ): Promise<TControllerResp<IRandomCoffeeEvent[]>> {
    const validateReq = Requester.validateParamWithData<FindAllEventsReqParam>(
      {
        query: req.query
      },
      JSCFindAllEvent
    );
    if (validateReq.result === false) {
      return {
        status: 400,
        error: {
          errorType: ENREQUEST_ERRORS.CLIENT,
          data: validateReq.errorMessage
        }
      };
    }
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new RandomCoffeeRequestBuilder(rbParam);
    const findAction = new RandomCoffee(rb);

    const actionResp = await findAction.findAll(
      validateReq.data,
      JSCFindAllEvent
    );

    const returnData = {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 204 : 200,
      payload: actionResp.data
    };

    return returnData;
  }

  public async find(
    req: Request
  ): Promise<TControllerResp<IRandomCoffeeEvent>> {
    const validateReq = Requester.validateParamWithData<FindEventReqParam>(
      {
        params: req.params
      },
      JSCFindEvent
    );
    if (validateReq.result === false) {
      return {
        status: 400,
        error: {
          errorType: ENREQUEST_ERRORS.CLIENT,
          data: validateReq.errorMessage
        }
      };
    }
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new RandomCoffeeRequestBuilder(rbParam);
    const findAction = new RandomCoffee(rb);

    const actionResp = await findAction.find(validateReq.data, JSCFindEvent);

    const returnData = {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 204 : 200,
      payload: actionResp.data
    };

    return returnData;
  }

  public async add(req: Request): Promise<TControllerResp<IRandomCoffeeEvent>> {
    const validateReq = Requester.validateParamWithData<AddRCEventReqParam>(
      {
        body: req.body
      },
      JSCAddRCEvent
    );
    if (validateReq.result === false) {
      return {
        status: 400,
        error: {
          errorType: ENREQUEST_ERRORS.CLIENT,
          data: validateReq.errorMessage
        }
      };
    }
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new RandomCoffeeRequestBuilder(rbParam);
    const findAction = new RandomCoffee(rb);

    const actionResp = await findAction.add(validateReq.data, JSCAddRCEvent);

    const returnData = {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };

    return returnData;
  }

  public async update(
    req: Request
  ): Promise<TControllerResp<IRandomCoffeeEvent>> {
    const validateReq = Requester.validateParamWithData<UpdateRCEventReqParam>(
      {
        params: req.params,
        body: req.body
      },
      JSCUpdateRCEvent
    );
    if (validateReq.result === false) {
      return {
        status: 400,
        error: {
          errorType: ENREQUEST_ERRORS.CLIENT,
          data: validateReq.errorMessage
        }
      };
    }
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new RandomCoffeeRequestBuilder(rbParam);
    const findAction = new RandomCoffee(rb);

    const actionResp = await findAction.update(
      validateReq.data,
      JSCUpdateRCEvent
    );

    const returnData = {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };

    return returnData;
  }

  public async findGuests(req: Request): Promise<TControllerResp<IUserInfo[]>> {
    const validateReq = Requester.validateParamWithData<FindEventReqParam>(
      {
        params: req.params
      },
      JSCFindEvent
    );
    if (validateReq.result === false) {
      return {
        status: 400,
        error: {
          errorType: ENREQUEST_ERRORS.CLIENT,
          data: validateReq.errorMessage
        }
      };
    }
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new RandomCoffeeRequestBuilder(rbParam);
    const findAction = new RandomCoffee(rb);

    const actionResp = await findAction.findGuests(
      validateReq.data,
      JSCFindEvent
    );

    const returnData = {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 204 : 200,
      payload: actionResp.data
    };

    return returnData;
  }

  public async addGuests(req: Request): Promise<TControllerResp<IUserInfo[]>> {
    const validateReq = Requester.validateParamWithData<
      AddRCEventGuestsReqParam
    >(
      {
        params: req.params,
        body: req.body
      },
      JSCAddRCEventGuests
    );
    if (validateReq.result === false) {
      return {
        status: 400,
        error: {
          errorType: ENREQUEST_ERRORS.CLIENT,
          data: validateReq.errorMessage
        }
      };
    }
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new RandomCoffeeRequestBuilder(rbParam);
    const findAction = new RandomCoffee(rb);

    const actionResp = await findAction.addGuests(
      validateReq.data,
      JSCAddRCEventGuests
    );

    const returnData = {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };

    return returnData;
  }

  public async delGuest(req: Request): Promise<TControllerResp<IUserInfo[]>> {
    const validateReq = Requester.validateParamWithData<DelRCEventGuestReq>(
      {
        params: req.params
      },
      JSCDelRCEventGuest
    );
    if (validateReq.result === false) {
      return {
        status: 400,
        error: {
          errorType: ENREQUEST_ERRORS.CLIENT,
          data: validateReq.errorMessage
        }
      };
    }
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new RandomCoffeeRequestBuilder(rbParam);
    const findAction = new RandomCoffee(rb);

    const actionResp = await findAction.delGuest(
      validateReq.data,
      JSCDelRCEventGuest
    );

    const returnData = {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 204 : 200,
      payload: actionResp.data
    };

    return returnData;
  }
}
