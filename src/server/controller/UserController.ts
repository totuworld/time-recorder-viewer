import { Request } from 'express';

import { Config } from '../../config/Config';
import { IUserInfo } from '../../models/user/interface/IUserInfo';
import {
    GetGroupUserInfosJSONSchema
} from '../../models/user/JSONSchema/GetGroupUserInfosJSONSchema';
import { GetUserInfoJSONSchema } from '../../models/user/JSONSchema/GetUserInfoJSONSchema';
import { User } from '../../models/user/User';
import { UserRequestBuilder } from '../../models/user/UserRequestBuilder';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { TControllerResp } from './ICommonController';

export class UserController {

  public async getGroupUserList(req: Request): Promise<TControllerResp<IUserInfo[]>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { groupId } = req.query;

    const checkParams = {
      query: {
        groupId,
      }
    };

    const rb = new UserRequestBuilder(rbParam);
    const findAction = new User(rb);

    const actionResp = await findAction.findGroups(
      checkParams,
      GetGroupUserInfosJSONSchema,
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data,
    };
  }

  public async getUserInfo(req: Request): Promise<TControllerResp<IUserInfo>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { userId } = req.query;

    const checkParams = {
      query: {
        userId,
      }
    };

    const rb = new UserRequestBuilder(rbParam);
    const findAction = new User(rb);

    const actionResp = await findAction.find(
      checkParams,
      GetUserInfoJSONSchema,
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data,
    };
  }

}