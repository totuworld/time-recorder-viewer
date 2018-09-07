import { Request } from 'express';

import { Config } from '../../config/Config';
import { Group } from '../../models/group/Group';
import { GroupRequestBuilder } from '../../models/group/GroupRequestBuilder';
import { IGroupInfo } from '../../models/group/interface/IGroupInfo';
import { IAddLoginUser } from '../../models/user/interface/IAddLoginUser';
import { ILoginUser } from '../../models/user/interface/ILoginUser';
import { IUserInfo } from '../../models/user/interface/IUserInfo';
import {
    GetGroupUserInfosJSONSchema
} from '../../models/user/JSONSchema/GetGroupUserInfosJSONSchema';
import { GetUserInfoJSONSchema } from '../../models/user/JSONSchema/GetUserInfoJSONSchema';
import { PostLoginUserJSONSchema } from '../../models/user/JSONSchema/PostLoginUserJSONSchema';
import { User } from '../../models/user/User';
import { UserRequestBuilder } from '../../models/user/UserRequestBuilder';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { TControllerResp } from './ICommonController';

export class GroupController {

  public async getAllGroupInfos(req: Request): Promise<TControllerResp<IGroupInfo[]>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new GroupRequestBuilder(rbParam);
    const findAction = new Group(rb);

    const actionResp = await findAction.findAllGroupInfos();

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 204 : 200,
      payload: actionResp.data,
    };
  }

}