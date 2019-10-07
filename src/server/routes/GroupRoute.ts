import { Router } from 'express';

import { GroupController } from '../controller/GroupController';
import { CommonRoute, EN_REQUEST_METHODS } from './CommonRoute';

export class GroupRoute extends CommonRoute {
  public static bootstrap(): GroupRoute {
    const trRoute = new GroupRoute(new GroupController(), '/api');

    trRoute.route(EN_REQUEST_METHODS.GET)(
      '/get_group_infos',
      trRoute.controller.getAllGroupInfos.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.POST)(
      '/groups/:group_id/:user_id',
      trRoute.controller.addMember.bind(trRoute.controller)
    );

    trRoute.route(EN_REQUEST_METHODS.DELETE)(
      '/groups/:group_id/:user_id',
      trRoute.controller.deleteMember.bind(trRoute.controller)
    );

    return trRoute;
  }

  constructor(public controller: GroupController, prefix: string) {
    super(Router(), prefix);
  }
}
