import debug from 'debug';
import { Request } from 'express';

import { Config } from '../../config/Config';
import { IAddTimeRecord, ITimeRecords } from '../../models/time_record/interface/ITimeRecords';
import {
    GetTimeRecordsJSONSchema
} from '../../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import {
    PostTimeRecordJSONSchema
} from '../../models/time_record/JSONSchema/PostTimeRecordJSONSchema';
import {
    PostUpdateTimeRecordJSONSchema
} from '../../models/time_record/JSONSchema/PostUpdateTimeRecordJSONSchema';
import { TimeRecord } from '../../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../../models/time_record/TimeRecordRequestBuilder';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { TControllerResp } from './ICommonController';

const log = debug('trv:TimeRecordController');

export class TimeRecordController {
  public async findTimeRecord(req: Request): Promise<TControllerResp<ITimeRecords['data']>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { userId, startDate, endDate } = req.query;

    const checkParams = {
      query: {
        userId,
        startDate,
        endDate,
      }
    };

    const rb = new TimeRecordRequestBuilder(rbParam);
    const findAction = new TimeRecord(rb);

    const actionResp = await findAction.findAll(
      checkParams,
      GetTimeRecordsJSONSchema,
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data,
    };
  }

  public async addTimeRecord(req: Request): Promise<TControllerResp<IAddTimeRecord['data']>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { user_id, auth_user_id, type, target_date, time } = req.body;

    const checkParams = {
      body: {
        auth_user_id,
        user_id,
        type,
        target_date,
        time,
      }
    };

    const rb = new TimeRecordRequestBuilder(rbParam);
    const findAction = new TimeRecord(rb);

    const actionResp = await findAction.addWork(
      checkParams,
      PostTimeRecordJSONSchema,
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data,
    };
  }

  public async updateTimeRecord(req: Request): Promise<TControllerResp<null>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { 
      auth_user_id,
      user_id,
      update_date,
      record_key,
      target_key,
      time,
    } = req.body;

    const checkParams = {
      body: {
        auth_user_id,
        user_id,
        update_date,
        record_key,
        target_key,
        time
      }
    };

    const rb = new TimeRecordRequestBuilder(rbParam);
    const findAction = new TimeRecord(rb);

    log(checkParams);

    const actionResp = await findAction.updateWorkLog(
      checkParams,
      PostUpdateTimeRecordJSONSchema,
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
    };
  }
}