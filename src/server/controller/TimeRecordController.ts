import { Request } from 'express';

import { Config } from '../../config/Config';
import { IAddTimeRecord, ITimeRecords } from '../../models/time_record/interface/ITimeRecords';
import {
    GetTimeRecordsJSONSchema
} from '../../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import {
    PostTimeRecordJSONSchema
} from '../../models/time_record/JSONSchema/PostTimeRecordJSONSchema';
import { TimeRecord } from '../../models/time_record/TimeRecord';
import { TimeRecordRequestBuilder } from '../../models/time_record/TimeRecordRequestBuilder';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { TControllerResp } from './ICommonController';

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
    const { user_id, text } = req.body;

    const checkParams = {
      body: {
        user_id,
        text,
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
}