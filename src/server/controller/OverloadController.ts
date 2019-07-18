import debug from 'debug';
import { Request } from 'express';

import { Config } from '../../config/Config';
import {
  IFuseOverWorks,
  IOverWorks,
  IOverWorkWithType
} from '../../models/time_record/interface/IOverWork';
import { IAddTimeRecord } from '../../models/time_record/interface/ITimeRecords';
import {
  GetOverloadByUserIDWithDateJSONSchema,
  GetOverloadsByUserIDJSONSchema,
  GetOverloadsJSONSchema
} from '../../models/time_record/JSONSchema/GetOverloadsJSONSchema';
import { PostAddOverloadJSONSchema } from '../../models/time_record/JSONSchema/PostAddOverloadJSONSchema';
import { Overload } from '../../models/time_record/Overload';
import { OverloadRequestBuilder } from '../../models/time_record/OverloadRequestBuilder';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { TControllerResp } from './ICommonController';

const log = debug('trv:OverloadController');

export class OverloadController {
  public async findAll(
    req: Request
  ): Promise<TControllerResp<IOverWorks['data']>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { auth_user_id } = req.query;

    const checkParams = {
      query: {
        auth_user_id
      }
    };

    log(checkParams);

    const rb = new OverloadRequestBuilder(rbParam);
    const findAction = new Overload(rb);

    const actionResp = await findAction.findAll(
      checkParams,
      GetOverloadsJSONSchema
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  public async findAllFuse(
    req: Request
  ): Promise<TControllerResp<IFuseOverWorks['data']>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { auth_user_id } = req.query;

    const checkParams = {
      query: {
        auth_user_id
      }
    };

    log(checkParams);

    const rb = new OverloadRequestBuilder(rbParam);
    const findAction = new Overload(rb);

    const actionResp = await findAction.findAllFuse(
      checkParams,
      GetOverloadsJSONSchema
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  public async findAllByUserID(
    req: Request
  ): Promise<TControllerResp<IOverWorks['data']>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { user_id } = req.query;

    const checkParams = {
      query: {
        user_id
      }
    };

    log(checkParams);

    const rb = new OverloadRequestBuilder(rbParam);
    const findAction = new Overload(rb);

    const actionResp = await findAction.findAllByUserID(
      checkParams,
      GetOverloadsByUserIDJSONSchema
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  public async findByUserIDWithDate(
    req: Request
  ): Promise<TControllerResp<IOverWorkWithType['data']>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { target_date } = req.params;
    const { user_id } = req.query;

    const checkParams = {
      target_date,
      query: {
        user_id
      }
    };

    log(checkParams);

    const rb = new OverloadRequestBuilder(rbParam);
    const findAction = new Overload(rb);

    const actionResp = await findAction.findByUserIdWithDate(
      checkParams,
      GetOverloadByUserIDWithDateJSONSchema
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  public async findAllFuseByUserID(
    req: Request
  ): Promise<TControllerResp<IFuseOverWorks['data']>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { user_id } = req.query;

    const checkParams = {
      query: {
        user_id
      }
    };

    log(checkParams);

    const rb = new OverloadRequestBuilder(rbParam);
    const findAction = new Overload(rb);

    const actionResp = await findAction.findAllFuseUserID(
      checkParams,
      GetOverloadsByUserIDJSONSchema
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  /** 초과근무 시간 차감 요청 */
  public async addFuseOverload(
    req: Request
  ): Promise<TControllerResp<IAddTimeRecord['data']>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const {
      user_id,
      auth_user_id,
      target_date,
      duration,
      isVacation,
      note
    } = req.body;

    const checkParams = {
      body: {
        auth_user_id,
        user_id,
        target_date,
        duration,
        isVacation,
        note
      }
    };
    log('addFuseOverload body', checkParams, req.body);

    const rb = new OverloadRequestBuilder(rbParam);
    const findAction = new Overload(rb);

    const actionResp = await findAction.addFuseLog(
      checkParams,
      PostAddOverloadJSONSchema
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }
}
