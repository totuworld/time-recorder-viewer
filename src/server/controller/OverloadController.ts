import debug from 'debug';
import { Request } from 'express';

import { Config } from '../../config/Config';
import { IAddOverWork } from '../../models/time_record/interface/IAddOverWork';
import {
  IFindAllFuseToVacation,
  IFuseOverWorks,
  IOverWorks,
  IOverWorkWithType,
  IUseFuseToVacation
} from '../../models/time_record/interface/IOverWork';
import { IAddTimeRecord } from '../../models/time_record/interface/ITimeRecords';
import { DeleteOverLoadByUserIDScheme } from '../../models/time_record/JSONSchema/DeleteOverLoadByUserIDScheme';
import {
  GetOverloadByUserIDWithDateJSONSchema,
  GetOverloadsByUserIDJSONSchema,
  GetOverloadsJSONSchema
} from '../../models/time_record/JSONSchema/GetOverloadsJSONSchema';
import { JSCFindAllFuseToVacation } from '../../models/time_record/JSONSchema/JSCFindAllFuseToVacation';
import { JSCPostAddOverWork } from '../../models/time_record/JSONSchema/JSCPostAddOverWork';
import { JSCPostAddOverWorkByGroup } from '../../models/time_record/JSONSchema/JSCPostAddOverWorkByGroup';
import { JSCPostConvertFuseToVacation } from '../../models/time_record/JSONSchema/JSCPostConvertFuseToVacation';
import { JSCPutDisableExpiredFuseToVacation } from '../../models/time_record/JSONSchema/JSCPutDisableExpiredFuseToVacation';
import { PostAddFuseJSONSchema } from '../../models/time_record/JSONSchema/PostAddFuseJSONSchema';
import { UseFuseToVacationJSONSchema } from '../../models/time_record/JSONSchema/UseFuseToVacationJSONSchema';
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

  public async deleteOverloadByUserID(
    req: Request
  ): Promise<TControllerResp<{ result: boolean }>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { auth_user_id, user_id, week } = req.body;

    const checkParams = {
      body: {
        auth_user_id,
        user_id,
        week
      }
    };

    log(checkParams);

    const rb = new OverloadRequestBuilder(rbParam);
    const findAction = new Overload(rb);

    const actionResp = await findAction.deleteOverLoad(
      checkParams,
      DeleteOverLoadByUserIDScheme
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

  /** 초과근무 시간으로 만든 휴가를 사용한다 */
  public async useFuseToVacation(
    req: Request
  ): Promise<TControllerResp<IUseFuseToVacation['data']>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { user_id, auth_user_id, target_date } = req.body;

    const checkParams = {
      body: {
        auth_user_id,
        user_id,
        target_date
      }
    };
    log('useFuseToVacation body', checkParams, req.body);

    const rb = new OverloadRequestBuilder(rbParam);
    const findAction = new Overload(rb);

    const actionResp = await findAction.useFuseToVacation(
      checkParams,
      UseFuseToVacationJSONSchema
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  /** 특정 그룹의 초과근무를 휴가금고에 넣는다. */
  public async convertFuseToVacationByGroupID(req: Request) {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { group_id } = req.params;
    const { note, auth_id, expireDate } = req.body;

    const checkParams = {
      params: {
        group_id
      },
      body: {
        auth_id,
        note,
        expireDate
      }
    };
    log('convertFuseToVacationByGroupID body', checkParams, req.body);

    const rb = new OverloadRequestBuilder(rbParam);
    const findAction = new Overload(rb);

    const actionResp = await findAction.convertFuseToVacationByGroupID(
      checkParams,
      JSCPostConvertFuseToVacation
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200
    };
  }

  public async findAllFuseToVacation(
    req: Request
  ): Promise<TControllerResp<IFindAllFuseToVacation['data']>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { user_id } = req.params;

    const rb = new OverloadRequestBuilder(rbParam);
    const findAction = new Overload(rb);

    const actionResp = await findAction.findAllFuseToVacationByUserID(
      {
        params: {
          user_id
        }
      },
      JSCFindAllFuseToVacation
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  /** 특정 그룹의 휴가금고를 만료 시킨다 */
  public async disableExpiredFuseToVacationByGroupID(req: Request) {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { group_id } = req.params;
    const { expireNote, auth_id, expireDate } = req.body;

    const checkParams = {
      params: {
        group_id
      },
      body: {
        auth_id,
        expireNote,
        expireDate
      }
    };
    log('disableExpiredFuseToVacationByGroupID body', checkParams, req.body);

    const rb = new OverloadRequestBuilder(rbParam);
    const findAction = new Overload(rb);

    const actionResp = await findAction.disableExpiredFuseToVacationByGroupID(
      checkParams,
      JSCPutDisableExpiredFuseToVacation
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200
    };
  }
}
