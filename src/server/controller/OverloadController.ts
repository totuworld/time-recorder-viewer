import debug from 'debug';
import { Request } from 'express';

import { Config } from '../../config/Config';
import { IOverWorks } from '../../models/time_record/interface/IOverWork';
import { GetOverloadsJSONSchema } from '../../models/time_record/JSONSchema/GetOverloadsJSONSchema';
import {
    GetTimeRecordsJSONSchema
} from '../../models/time_record/JSONSchema/GetTimeRecordsJSONSchema';
import {
    PostTimeRecordJSONSchema
} from '../../models/time_record/JSONSchema/PostTimeRecordJSONSchema';
import {
    PostUpdateTimeRecordJSONSchema
} from '../../models/time_record/JSONSchema/PostUpdateTimeRecordJSONSchema';
import { Overload } from '../../models/time_record/Overload';
import { OverloadRequestBuilder } from '../../models/time_record/OverloadRequestBuilder';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { TControllerResp } from './ICommonController';

const log = debug('trv:OverloadController');

export class OverloadController {
  public async findAll(req: Request): Promise<TControllerResp<IOverWorks['data']>> {
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
      GetOverloadsJSONSchema,
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data,
    };
  }
}