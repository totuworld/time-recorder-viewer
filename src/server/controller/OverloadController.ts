import debug from 'debug';
import { Request } from 'express';

import { Config } from '../../config/Config';
import { IAddOverWork } from '../../models/time_record/interface/IAddOverWork';
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
import { JSCPostAddOverWork } from '../../models/time_record/JSONSchema/JSCPostAddOverWork';
import { JSCPostAddOverWorkByGroup } from '../../models/time_record/JSONSchema/JSCPostAddOverWorkByGroup';
import { PostAddFuseJSONSchema } from '../../models/time_record/JSONSchema/PostAddFuseJSONSchema';
import { Overload } from '../../models/time_record/Overload';
import { OverloadRequestBuilder } from '../../models/time_record/OverloadRequestBuilder';
import { TimeRecord } from '../../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../../models/time_record/TimeRecordRequestBuilder';
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
      PostAddFuseJSONSchema
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  public async addOverWorkByUser(
    req: Request
  ): Promise<TControllerResp<IAddOverWork['data']>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { user_id, week, manager_id } = req.body;

    const checkParams = {
      body: {
        user_id,
        week,
        manager_id
      }
    };
    log('addOverWorkByUser body', checkParams, req.body);

    const trRb = new TimeRecordRequestBuilder(rbParam);
    const trAction = new TimeRecord(trRb);

    const actionResp = await trAction.addOverWorkByUser(
      {
        body: {
          user_id,
          week,
          manager_id
        }
      },
      JSCPostAddOverWork
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  public async addOverWorkByGroup(
    req: Request
  ): Promise<TControllerResp<IAddOverWork['data']>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { group_id, week, manager_id } = req.body;

    const checkParams = {
      body: {
        group_id,
        week,
        manager_id
      }
    };
    log('addOverWorkByUser body', checkParams, req.body);

    const trRb = new TimeRecordRequestBuilder(rbParam);
    const trAction = new TimeRecord(trRb);

    const actionResp = await trAction.addOverWorkByGroup(
      {
        body: {
          group_id,
          week,
          manager_id
        }
      },
      JSCPostAddOverWorkByGroup
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200
    };
  }
}
