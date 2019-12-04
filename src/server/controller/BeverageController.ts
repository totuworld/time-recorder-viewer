import { Request } from 'express';

import { Config } from '../../config/Config';
import { Beverage } from '../../models/beverage/Beverage';
import { BeverageRequestBuilder } from '../../models/beverage/BeverageRequestBuilder';
import { AddBeverageReqParam } from '../../models/beverage/interface/AddBeverageReqParam';
import { FindAllBeverageReqParam } from '../../models/beverage/interface/FindAllBeverageReqParam';
import { IBeverage } from '../../models/beverage/interface/IBeverage';
import { JSCAddBeverage } from '../../models/beverage/JSONSchema/JSCAddBeverage';
import { JSCFindAllBeverage } from '../../models/beverage/JSONSchema/JSCFindAllBeverage';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { Requester } from '../../services/requestService/Requester';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { TControllerResp } from './ICommonController';

export class BeverageController {
  public async findAll(req: Request): Promise<TControllerResp<IBeverage[]>> {
    const validateReq = Requester.validateParamWithData<
      FindAllBeverageReqParam
    >(
      {
        query: req.query
      },
      JSCFindAllBeverage
    );
    if (validateReq.result === false) {
      return {
        status: 400
      };
    }
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new BeverageRequestBuilder(rbParam);
    const findAction = new Beverage(rb);

    const actionResp = await findAction.findAll(
      validateReq.data,
      JSCFindAllBeverage
    );

    return actionResp.type === EN_REQUEST_RESULT.ERROR
      ? {
          status: 400
        }
      : {
          status: 200,
          payload: actionResp.data
        };
  }

  public async add(req: Request): Promise<TControllerResp<IBeverage>> {
    const validateReq = Requester.validateParamWithData<AddBeverageReqParam>(
      {
        body: req.body
      },
      JSCAddBeverage
    );
    if (validateReq.result === false) {
      return {
        status: 400
      };
    }
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new BeverageRequestBuilder(rbParam);
    const findAction = new Beverage(rb);

    const actionResp = await findAction.add(validateReq.data, JSCAddBeverage);

    return actionResp.type === EN_REQUEST_RESULT.ERROR
      ? {
          status: 400
        }
      : {
          status: 200,
          payload: actionResp.data
        };
  }
}
