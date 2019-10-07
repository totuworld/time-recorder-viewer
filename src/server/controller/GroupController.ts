import debug from 'debug';
import { Request } from 'express';

import { Config } from '../../config/Config';
import { Group } from '../../models/group/Group';
import { GroupRequestBuilder } from '../../models/group/GroupRequestBuilder';
import { IGroupInfo } from '../../models/group/interface/IGroupInfo';
import { RequestBuilderParams } from '../../services/requestService/RequestBuilder';
import { EN_REQUEST_RESULT } from '../../services/requestService/requesters/AxiosRequester';
import { TControllerResp } from './ICommonController';

const log = debug('trv:GroupController');

export class GroupController {
  public async getAllGroupInfos(
    req: Request
  ): Promise<TControllerResp<IGroupInfo[]>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };

    const rb = new GroupRequestBuilder(rbParam);
    const findAction = new Group(rb);

    const actionResp = await findAction.findAllGroupInfos();

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 204 : 200,
      payload: actionResp.data
    };
  }

  public async addMember(req: Request): Promise<TControllerResp<boolean>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { group_id, user_id } = req.params;
    const { manager_id } = req.body;

    log(group_id, user_id, manager_id);

    const rb = new GroupRequestBuilder(rbParam);
    const findAction = new Group(rb);

    const actionResp = await findAction.addMember({
      group_id,
      manager_id,
      user_id
    });

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 204 : 200,
      payload: actionResp.data
    };
  }

  public async deleteMember(req: Request): Promise<TControllerResp<boolean>> {
    const rbParam: RequestBuilderParams = { baseURI: Config.getApiURI() };
    const { group_id, user_id } = req.params;
    const { manager_id } = req.body;

    log(group_id, user_id, manager_id);

    const rb = new GroupRequestBuilder(rbParam);
    const findAction = new Group(rb);

    const actionResp = await findAction.deleteMember({
      group_id,
      manager_id,
      user_id
    });

    return {
      status: actionResp.type === EN_REQUEST_RESULT.ERROR ? 204 : 200,
      payload: actionResp.data
    };
  }
}
