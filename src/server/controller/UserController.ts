import { Request } from 'express';

import { Config } from '../../config/Config';
import { IAddLoginUser } from '../../models/user/interface/IAddLoginUser';
import { ILoginUser } from '../../models/user/interface/ILoginUser';
import {
  ISlackUserInfo,
  IUserInfo
} from '../../models/user/interface/IUserInfo';
import { GetGroupUserInfosJSONSchema } from '../../models/user/JSONSchema/GetGroupUserInfosJSONSchema';
import { GetUserInfoJSONSchema } from '../../models/user/JSONSchema/GetUserInfoJSONSchema';
import { PostLoginUserJSONSchema } from '../../models/user/JSONSchema/PostLoginUserJSONSchema';
import { User } from '../../models/user/User';
import { UserRequestBuilder } from '../../models/user/UserRequestBuilder';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { TControllerResp } from './ICommonController';

export class UserController {
  public async getGroupUserList(
    req: Request
  ): Promise<TControllerResp<IUserInfo[]>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { groupId } = req.query;

    const checkParams = {
      query: {
        groupId
      }
    };

    const rb = new UserRequestBuilder(rbParam);
    const findAction = new User(rb);

    const actionResp = await findAction.findGroups(
      checkParams,
      GetGroupUserInfosJSONSchema
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  public async getUserInfo(req: Request): Promise<TControllerResp<IUserInfo>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { userId } = req.query;

    const checkParams = {
      query: {
        userId
      }
    };

    const rb = new UserRequestBuilder(rbParam);
    const findAction = new User(rb);

    const actionResp = await findAction.find(
      checkParams,
      GetUserInfoJSONSchema
    );

    const returnData = {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };

    return returnData;
  }

  public async addLoginUser(
    req: Request
  ): Promise<TControllerResp<IAddLoginUser>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { userUid, email } = req.body;

    const checkParams = {
      body: {
        userUid,
        email
      }
    };

    const rb = new UserRequestBuilder(rbParam);
    const findAction = new User(rb);

    const actionResp = await findAction.addLoginUser(
      checkParams,
      PostLoginUserJSONSchema
    );

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  public async getLoginUserInfo(
    req: Request
  ): Promise<TControllerResp<ILoginUser>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { user_uid } = req.params;

    const checkParams = { user_uid };

    const rb = new UserRequestBuilder(rbParam);
    const findAction = new User(rb);

    const actionResp = await findAction.findLoginUser(checkParams);

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  public async getAllSlackUserInfo(
    _: Request
  ): Promise<TControllerResp<ISlackUserInfo[]>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new UserRequestBuilder(rbParam);
    const findAction = new User(rb);

    const actionResp = await findAction.findAllSlackUsers();

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };
  }

  public async findQueue(
    req: Request
  ): Promise<TControllerResp<ISlackUserInfo[]>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const { authId } = req.params;

    const rb = new UserRequestBuilder(rbParam);
    const findAction = new User(rb);

    const actionResp = await findAction.findQueue({
      authId
    });

    const returnData = {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };

    return returnData;
  }

  public async addQueue(
    req: Request
  ): Promise<TControllerResp<ISlackUserInfo[]>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const { userId } = req.params;
    const { reqUserId } = req.body;

    const rb = new UserRequestBuilder(rbParam);
    const findAction = new User(rb);

    const actionResp = await findAction.addQueue({
      userId,
      body: {
        reqUserId
      }
    });

    const returnData = {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };

    return returnData;
  }

  public async deleteQueue(
    req: Request
  ): Promise<TControllerResp<ISlackUserInfo[]>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const { authId, key } = req.params;

    const rb = new UserRequestBuilder(rbParam);
    const findAction = new User(rb);

    const actionResp = await findAction.deleteQueue({
      authId,
      key
    });

    const returnData = {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 400 : 200,
      payload: actionResp.data
    };

    return returnData;
  }
}
